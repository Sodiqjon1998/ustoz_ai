<?php

namespace App\Services\Generator;

/**
 * Tarqatma material — o'quvchi to'ldiradigan RANGLI ISH DAFTARI.
 *
 * O'yinlar (anagramma, moslashtirish, so'z izlash, krossvord) mavzuning
 * tekshirilgan atamalaridan (key_terms) MEXANIK yasaladi — ya'ni o'yin hech
 * qachon yolg'on fakt chiqarmaydi: anagramma to'g'ri so'zning harflarini
 * aralashtiradi, krossvord haqiqiy so'zlarni to'rga joylaydi. Yagona
 * ma'lumot manbai — atamalar ro'yxati, u darsning qolgan qismi bilan bir
 * xil ishonchlilikda.
 *
 * Ranglar sinfga qarab: 1-4 sinf "primary" (yorqin, o'yinbop), 5-11 sinf
 * "senior" (fan palitrasi, jiddiyroq). Palitrani generator (Node) tanlaydi;
 * bu yerda faqat "grade_band" beriladi.
 */
class HandoutBuilder
{
    /**
     * Har bir sinf bandi uchun ruxsat etilgan o'yin turlari. Frontend wizard
     * shu ro'yxatga mos checkbox ko'rsatadi; bu yerdagi filtr — himoya qatlami
     * (frontend chetlab o'tilsa ham, boshlang'ich sinfga krossvord tushmasin).
     */
    public const PRIMARY_GAMES = ['anagram', 'matching', 'wordsearch', 'sequence', 'flashcard', 'compare', 'grammar', 'writing', 'fillblank'];

    public const SENIOR_GAMES = ['matching', 'wordsearch', 'sequence', 'crossword', 'truefalse', 'flashcard', 'compare', 'grammar'];

    public function build(string $topic, string $subjectName, string $themeKey, int $grade, int $duration, array $content, array $selectedGames = []): array
    {
        $terms = $this->cleanTerms((array) ($content['key_terms'] ?? []));
        $phases = $this->cleanPhases((array) ($content['phases'] ?? []));
        $slides = (array) ($content['slides'] ?? []);
        $grammarRows = (array) ($content['grammar_table'] ?? []);

        $gradeBand = $grade <= 4 ? 'primary' : 'senior';
        $allowed = $gradeBand === 'primary' ? self::PRIMARY_GAMES : self::SENIOR_GAMES;
        $selectedTypes = empty($selectedGames) ? $allowed : array_values(array_intersect($allowed, $selectedGames));

        $games = $this->buildGames($terms, $phases, $slides, $grammarRows, $selectedTypes);

        return [
            'title' => $topic,
            'subjectName' => $subjectName,
            'theme' => $themeKey,
            'grade' => $grade,
            'duration' => $duration,
            'grade_band' => $gradeBand,
            'objective' => (string) ($content['objective_main'] ?? ''),
            'games' => $games,
            // O'qituvchi uchun javoblar kaliti — o'yinlarning yechimi.
            'answer_key' => $this->buildAnswerKey($games),
        ];
    }

    /**
     * @return array<int, array{term: string, upper: string, clue: string, translation: string}>
     */
    private function cleanTerms(array $raw): array
    {
        $terms = [];
        $seen = [];

        foreach ($raw as $t) {
            if (! is_array($t) || empty($t['term'])) {
                continue;
            }

            $term = trim((string) $t['term']);
            $clue = trim((string) ($t['clue'] ?? ''));
            $translation = trim((string) ($t['translation'] ?? ''));

            if ($clue === '' || ! preg_match('/^\p{L}{3,12}$/u', $term)) {
                continue;
            }

            $upper = $this->mbUpper($term);
            if (isset($seen[$upper])) {
                continue;
            }
            $seen[$upper] = true;

            $terms[] = ['term' => $term, 'upper' => $upper, 'clue' => $clue, 'translation' => $translation];
        }

        return $terms;
    }

    /**
     * O'yinlar to'plami. Har bir o'yin uchun yetarli atama bo'lmasa, u
     * o'yin o'tkazib yuboriladi (chala o'yin ko'rsatilmaydi). `$selectedTypes`
     * — o'qituvchi (yoki sinf bandi) tanlagan turlar, faqat shular quriladi.
     */
    private function buildGames(array $terms, array $phases, array $slides, array $grammarRows, array $selectedTypes): array
    {
        $games = [];

        // Takrorlanuvchanlik uchun urug'ni atamalardan hosil qilamiz — bir xil
        // dars har safar bir xil o'yin beradi (foydalanuvchi qayta yasasa
        // farqni ko'rmaydi, chalkashlik bo'lmaydi).
        mt_srand(crc32(implode('|', array_column($terms, 'upper'))) & 0x7fffffff);

        if (in_array('anagram', $selectedTypes, true) && count($terms) >= 4) {
            $games[] = $this->anagramGame(array_slice($terms, 0, 6));
        }

        if (in_array('matching', $selectedTypes, true) && count($terms) >= 4) {
            $games[] = $this->matchingGame(array_slice($terms, 0, 6));
        }

        if (in_array('wordsearch', $selectedTypes, true)) {
            $wordSearch = $this->wordSearchGame($terms);
            if ($wordSearch !== null) {
                $games[] = $wordSearch;
            }
        }

        if (in_array('crossword', $selectedTypes, true)) {
            $crossword = $this->crosswordGame($terms);
            if ($crossword !== null) {
                $games[] = $crossword;
            }
        }

        if (in_array('sequence', $selectedTypes, true) && count($phases) >= 3) {
            $games[] = $this->sequenceGame($phases);
        }

        if (in_array('truefalse', $selectedTypes, true) && count($terms) >= 6) {
            $games[] = $this->trueFalseGame($terms);
        }

        if (in_array('flashcard', $selectedTypes, true) && count($terms) >= 4) {
            $games[] = $this->flashcardBlock($terms);
        }

        if (in_array('compare', $selectedTypes, true)) {
            $compare = $this->compareBlock($slides);
            if ($compare !== null) {
                $games[] = $compare;
            }
        }

        if (in_array('grammar', $selectedTypes, true)) {
            $grammar = $this->grammarBlock($grammarRows);
            if ($grammar !== null) {
                $games[] = $grammar;
            }
        }

        if (in_array('writing', $selectedTypes, true)) {
            $writing = $this->writingPracticeBlock($terms);
            if ($writing !== null) {
                $games[] = $writing;
            }
        }

        if (in_array('fillblank', $selectedTypes, true)) {
            $fillBlank = $this->fillBlankBlock($terms);
            if ($fillBlank !== null) {
                $games[] = $fillBlank;
            }
        }

        mt_srand();

        return $games;
    }

    /** @return array<int, string> */
    private function cleanPhases(array $raw): array
    {
        $names = [];

        foreach ($raw as $p) {
            $name = trim((string) (is_array($p) ? ($p['name'] ?? '') : ''));
            if ($name !== '') {
                $names[] = $name;
            }
        }

        return $names;
    }

    // ---- 1) ANAGRAMMA -----------------------------------------------------

    private function anagramGame(array $terms): array
    {
        $items = [];

        foreach ($terms as $t) {
            $items[] = [
                'scrambled' => $this->scramble($t['upper']),
                'clue' => $t['clue'],
                'answer' => $t['upper'],
                'length' => $this->mbLen($t['upper']),
            ];
        }

        return [
            'type' => 'anagram',
            'title' => 'Anagramma',
            'instruction' => "Harflar aralashib ketgan. Ularni to'g'ri tartibga solib, so'zni top.",
            'items' => $items,
        ];
    }

    /** So'z harflarini asl tartibidan farqli qilib aralashtiradi. */
    private function scramble(string $word): string
    {
        $chars = $this->mbSplit($word);

        if (count($chars) < 2) {
            return $word;
        }

        $shuffled = $chars;
        for ($attempt = 0; $attempt < 12; $attempt++) {
            for ($i = count($shuffled) - 1; $i > 0; $i--) {
                $j = mt_rand(0, $i);
                [$shuffled[$i], $shuffled[$j]] = [$shuffled[$j], $shuffled[$i]];
            }

            if (implode('', $shuffled) !== $word) {
                break;
            }
        }

        return implode(' ', $shuffled);
    }

    // ---- 2) MOSLASHTIRISH -------------------------------------------------

    private function matchingGame(array $terms): array
    {
        $left = [];
        $right = [];

        foreach ($terms as $i => $t) {
            $left[] = ['label' => $this->numberLabel($i + 1), 'term' => $t['upper']];
            $right[] = ['clue' => $t['clue'], 'answer_index' => $i];
        }

        // O'ng ustunni aralashtiramiz — javoblar bir qatorda bo'lmasin.
        $order = range(0, count($right) - 1);
        $this->shuffleInPlace($order);

        $shuffledRight = [];
        foreach ($order as $letterIdx => $origIdx) {
            $shuffledRight[] = [
                'label' => $this->letterLabel($letterIdx),
                'clue' => $right[$origIdx]['clue'],
                'answer_number' => $origIdx + 1,
            ];
        }

        return [
            'type' => 'matching',
            'title' => 'Moslashtirish',
            'instruction' => "Chap ustundagi har bir atamani o'ng ustundagi mos ta'rifi bilan chiziq orqali birlashtir.",
            'left' => $left,
            'right' => $shuffledRight,
        ];
    }

    // ---- 3) SO'Z IZLASH (word search) -------------------------------------

    private function wordSearchGame(array $terms): ?array
    {
        // Grid uchun faqat 8 harfgacha bo'lgan so'zlar — uzun so'z to'rga sig'maydi.
        $candidates = array_values(array_filter(
            $terms,
            fn ($t) => $this->mbLen($t['upper']) <= 8 && $this->mbLen($t['upper']) >= 3
        ));

        if (count($candidates) < 4) {
            return null;
        }

        $words = array_slice($candidates, 0, 10);
        $longest = 0;
        foreach ($words as $w) {
            $longest = max($longest, $this->mbLen($w['upper']));
        }

        // Ilgari 10-13 edi — o'quvchi juda tez topib qo'yardi. Kattaroq to'r
        // (13-16) ko'proq bo'sh/chalg'ituvchi harflar qo'shadi, biroz qiynaydi.
        $size = min(16, max(13, $longest + 3));
        $alphabet = $this->alphabetOf($words);

        // Yo'nalishlar: gorizontal, vertikal, diagonal (pastga).
        $directions = [[0, 1], [1, 0], [1, 1]];

        $grid = array_fill(0, $size, array_fill(0, $size, null));
        $placed = [];

        foreach ($words as $w) {
            $chars = $this->mbSplit($w['upper']);
            $len = count($chars);

            for ($try = 0; $try < 120; $try++) {
                $dir = $directions[mt_rand(0, count($directions) - 1)];
                $maxRow = $dir[0] ? $size - $len : $size - 1;
                $maxCol = $dir[1] ? $size - $len : $size - 1;

                if ($maxRow < 0 || $maxCol < 0) {
                    continue;
                }

                $row = mt_rand(0, $maxRow);
                $col = mt_rand(0, $maxCol);

                if (! $this->fits($grid, $chars, $row, $col, $dir)) {
                    continue;
                }

                $cells = [];
                for ($k = 0; $k < $len; $k++) {
                    $r = $row + $dir[0] * $k;
                    $c = $col + $dir[1] * $k;
                    $grid[$r][$c] = $chars[$k];
                    $cells[] = [$r, $c];
                }

                $placed[] = ['word' => $w['upper'], 'cells' => $cells];
                break;
            }
        }

        if (count($placed) < 4) {
            return null;
        }

        // Bo'sh kataklarni tasodifiy harflar bilan to'ldiramiz.
        for ($r = 0; $r < $size; $r++) {
            for ($c = 0; $c < $size; $c++) {
                if ($grid[$r][$c] === null) {
                    $grid[$r][$c] = $alphabet[mt_rand(0, count($alphabet) - 1)];
                }
            }
        }

        return [
            'type' => 'wordsearch',
            'title' => "So'z izlash",
            'instruction' => "Jadvaldan quyidagi so'zlarni top va ustidan chiz. So'zlar gorizontal, vertikal yoki diagonal bo'lishi mumkin.",
            'grid' => $grid,
            'words' => array_map(fn ($p) => $p['word'], $placed),
            'solution' => $placed,
        ];
    }

    private function fits(array $grid, array $chars, int $row, int $col, array $dir): bool
    {
        foreach ($chars as $k => $ch) {
            $r = $row + $dir[0] * $k;
            $c = $col + $dir[1] * $k;
            $existing = $grid[$r][$c];

            if ($existing !== null && $existing !== $ch) {
                return false;
            }
        }

        return true;
    }

    // ---- 4) KROSSVORD -----------------------------------------------------

    private function crosswordGame(array $terms): ?array
    {
        $candidates = array_values(array_filter(
            $terms,
            fn ($t) => $this->mbLen($t['upper']) >= 3 && $this->mbLen($t['upper']) <= 10
        ));

        if (count($candidates) < 4) {
            return null;
        }

        // Uzunroq so'zlar avval joylashtirilsa, kesishish ehtimoli yuqori.
        usort($candidates, fn ($a, $b) => $this->mbLen($b['upper']) - $this->mbLen($a['upper']));

        $best = null;
        // Bir necha marta urinib, eng ko'p so'z joylashgan variantni olamiz.
        for ($attempt = 0; $attempt < 8; $attempt++) {
            $layout = $this->tryCrossword(array_slice($candidates, 0, 8));
            if ($best === null || count($layout['entries']) > count($best['entries'])) {
                $best = $layout;
            }
        }

        if ($best === null || count($best['entries']) < 4) {
            return null;
        }

        return $this->finalizeCrossword($best);
    }

    private function tryCrossword(array $words): array
    {
        $cells = [];   // "r,c" => harf
        $entries = []; // joylashgan so'zlar

        $place = function (array $chars, int $row, int $col, array $dir) use (&$cells) {
            foreach ($chars as $k => $ch) {
                $r = $row + $dir[0] * $k;
                $c = $col + $dir[1] * $k;
                $cells["{$r},{$c}"] = $ch;
            }
        };

        // Birinchi so'z gorizontal, markazda.
        $first = $this->mbSplit($words[0]['upper']);
        $place($first, 0, 0, [0, 1]);
        $entries[] = ['word' => $words[0]['upper'], 'clue' => $words[0]['clue'], 'row' => 0, 'col' => 0, 'dir' => [0, 1]];

        for ($i = 1; $i < count($words); $i++) {
            $chars = $this->mbSplit($words[$i]['upper']);
            $done = false;

            foreach ($chars as $ci => $ch) {
                if ($done) {
                    break;
                }

                // Shu harf allaqachon gridda bormi — o'sha yerda kesishtiramiz.
                foreach ($cells as $pos => $existing) {
                    if ($existing !== $ch) {
                        continue;
                    }

                    [$er, $ec] = array_map('intval', explode(',', $pos));

                    // Mavjud so'z gorizontal bo'lsa, yangisini vertikal qo'yamiz (va aksincha).
                    foreach ([[1, 0], [0, 1]] as $dir) {
                        $row = $er - $dir[0] * $ci;
                        $col = $ec - $dir[1] * $ci;

                        if ($this->crosswordFits($cells, $chars, $row, $col, $dir)) {
                            $place($chars, $row, $col, $dir);
                            $entries[] = ['word' => $words[$i]['upper'], 'clue' => $words[$i]['clue'], 'row' => $row, 'col' => $col, 'dir' => $dir];
                            $done = true;
                            break 2;
                        }
                    }
                }
            }
        }

        return ['cells' => $cells, 'entries' => $entries];
    }

    /**
     * So'z shu joyga sig'adimi: har bir katak bo'sh yoki bir xil harf bo'lsin,
     * kesishmagan qo'shni kataklar bo'sh bo'lsin (so'zlar yopishib qolmasin),
     * boshi va oxiri ochiq bo'lsin.
     */
    private function crosswordFits(array $cells, array $chars, int $row, int $col, array $dir): bool
    {
        $len = count($chars);
        [$dr, $dc] = $dir;

        // Boshidan oldingi va oxiridan keyingi katak bo'sh bo'lishi kerak.
        $beforeKey = ($row - $dr).','.($col - $dc);
        $afterKey = ($row + $dr * $len).','.($col + $dc * $len);
        if (isset($cells[$beforeKey]) || isset($cells[$afterKey])) {
            return false;
        }

        $hasCross = false;

        foreach ($chars as $k => $ch) {
            $r = $row + $dr * $k;
            $c = $col + $dc * $k;
            $key = "{$r},{$c}";

            if (isset($cells[$key])) {
                if ($cells[$key] !== $ch) {
                    return false;
                }
                $hasCross = true;

                continue;
            }

            // Bo'sh katak — perpendikulyar qo'shnilari ham bo'sh bo'lsin
            // (aks holda ikkita so'z yonma-yon yopishib, o'qib bo'lmaydi).
            $perp = [$dc, $dr]; // perpendikulyar yo'nalish
            foreach ([1, -1] as $s) {
                $nk = ($r + $perp[0] * $s).','.($c + $perp[1] * $s);
                if (isset($cells[$nk])) {
                    return false;
                }
            }
        }

        // Kamida bitta kesishish bo'lishi shart (birinchi so'zdan keyin).
        return $hasCross;
    }

    private function finalizeCrossword(array $layout): array
    {
        // Koordinatalarni 0 dan boshlanadigan qilib normallashtirish.
        $rows = [];
        $cols = [];
        foreach (array_keys($layout['cells']) as $pos) {
            [$r, $c] = array_map('intval', explode(',', $pos));
            $rows[] = $r;
            $cols[] = $c;
        }

        $minR = min($rows);
        $minC = min($cols);
        $height = max($rows) - $minR + 1;
        $width = max($cols) - $minC + 1;

        // Katak raqamlarini so'z boshlariga beramiz (chapdan-o'ngga, yuqoridan-pastga).
        $starts = [];
        foreach ($layout['entries'] as $e) {
            $r = $e['row'] - $minR;
            $c = $e['col'] - $minC;
            $starts["{$r},{$c}"] = true;
        }

        $numberAt = [];
        $n = 0;
        for ($r = 0; $r < $height; $r++) {
            for ($c = 0; $c < $width; $c++) {
                if (isset($starts["{$r},{$c}"])) {
                    $n++;
                    $numberAt["{$r},{$c}"] = $n;
                }
            }
        }

        // Grid: har katak {letter, number|null} yoki null (blok).
        $grid = array_fill(0, $height, array_fill(0, $width, null));
        foreach ($layout['cells'] as $pos => $letter) {
            [$r, $c] = array_map('intval', explode(',', $pos));
            $r -= $minR;
            $c -= $minC;
            $grid[$r][$c] = [
                'letter' => $letter,
                'number' => $numberAt["{$r},{$c}"] ?? null,
            ];
        }

        $across = [];
        $down = [];
        foreach ($layout['entries'] as $e) {
            $r = $e['row'] - $minR;
            $c = $e['col'] - $minC;
            $num = $numberAt["{$r},{$c}"] ?? 0;
            $item = ['number' => $num, 'clue' => $e['clue'], 'answer' => $e['word']];

            if ($e['dir'] === [0, 1]) {
                $across[] = $item;
            } else {
                $down[] = $item;
            }
        }

        usort($across, fn ($a, $b) => $a['number'] - $b['number']);
        usort($down, fn ($a, $b) => $a['number'] - $b['number']);

        return [
            'type' => 'crossword',
            'title' => 'Krossvord',
            'instruction' => "Ta'riflar bo'yicha so'zlarni top va katakchalarga yoz.",
            'width' => $width,
            'height' => $height,
            'grid' => $grid,
            'across' => $across,
            'down' => $down,
        ];
    }

    // ---- 5) TO'G'RI TARTIB (sequencing) ------------------------------------

    /**
     * Dars bosqichlari nomlarini (allaqachon Gemini tomonidan to'g'ri
     * pedagogik tartibda generatsiya qilingan, konspektda ham ishlatiladigan
     * `phases`) aralashtirib, o'quvchidan asl tartibni tiklashni so'raydi.
     * Yangi AI matni yo'q — faqat mavjud bosqich nomlarining tartibi o'zgaradi.
     */
    private function sequenceGame(array $phases): array
    {
        $count = min(6, count($phases));
        $selected = array_slice($phases, 0, $count);

        $order = range(0, $count - 1);
        $this->shuffleInPlace($order);

        // Tasodifan asl tartibda chiqib qolsa, o'yin ma'nosiz bo'ladi.
        if ($count > 1 && $order === range(0, $count - 1)) {
            [$order[0], $order[1]] = [$order[1], $order[0]];
        }

        $items = [];
        foreach ($order as $displayIdx => $origIdx) {
            $items[] = [
                'label' => $this->letterLabel($displayIdx),
                'text' => $selected[$origIdx],
                'correct_order' => $origIdx + 1,
            ];
        }

        return [
            'type' => 'sequence',
            'title' => "To'g'ri tartib",
            'instruction' => "Dars bosqichlari aralashtirilgan. To'g'ri ketma-ketlikni belgilab, har biri yoniga tartib raqamini (1, 2, 3...) yoz.",
            'items' => $items,
        ];
    }

    // ---- 6) TO'G'RI YOKI NOTO'G'RI (true/false) ----------------------------

    /**
     * Atama+ta'rif juftliklarining bir qismini ATAYLAB boshqa atamaning
     * ta'rifi bilan aralashtirib, o'quvchidan "to'g'ri/noto'g'ri" ekanini
     * aniqlashni so'raydi. Yangi fakt o'ylab topilmaydi — faqat mavjud,
     * tekshirilgan term/clue juftliklari qayta kombinatsiyalanadi.
     */
    private function trueFalseGame(array $terms): array
    {
        $pool = array_slice($terms, 0, min(8, count($terms)));
        $n = count($pool);
        $half = intdiv($n, 2);

        $order = range(0, $n - 1);
        $this->shuffleInPlace($order);

        $statements = [];
        foreach ($order as $i => $termIdx) {
            $term = $pool[$termIdx];
            $isTrue = $i < $half;

            if ($isTrue) {
                $clue = $term['clue'];
            } else {
                // Boshqa (o'zidan farqli) atamaning ta'rifi — soxta fakt emas,
                // shunchaki noto'g'ri juftlik.
                $otherIdx = ($termIdx + 1) % $n;
                $clue = $pool[$otherIdx]['clue'];
            }

            $statements[] = ['term' => $term['upper'], 'clue' => $clue, 'answer' => $isTrue];
        }

        $this->shuffleInPlace($statements);

        foreach ($statements as $i => &$s) {
            $s['number'] = $i + 1;
        }
        unset($s);

        return [
            'type' => 'truefalse',
            'title' => "To'g'ri yoki noto'g'ri?",
            'instruction' => "Har bir juftlikni o'qi. Atama va ta'rif to'g'ri mos kelsa \"T\", mos kelmasa \"N\" deb belgila.",
            'items' => $statements,
        ];
    }

    // ---- 7) KARTOCHKALAR (flashcard) ---------------------------------------

    /**
     * Kesib olinadigan ikki tomonlama kartochkalar: old tomonda atama, orqa
     * tomonda — chet tili darsida tarjima (masalan "apple" → "olma"), boshqa
     * fanlarda ta'rif. Ikkala tomon PDF'da bir xil to'r (qator-ustun)
     * tartibida chiziladi — duplex chop etilganda old/orqa mos tushishi uchun.
     */
    private function flashcardBlock(array $terms): array
    {
        $pool = array_slice($terms, 0, min(8, count($terms)));
        $isTranslation = count(array_filter($pool, fn ($t) => $t['translation'] !== '')) > 0;

        return [
            'type' => 'flashcard',
            'title' => 'Kartochkalar',
            'instruction' => $isTranslation
                ? "Sahifalarni kesib, ikki tomonlama kartochka yasang: bir tomonda so'z, ikkinchi tomonda tarjimasi."
                : "Sahifalarni kesib, ikki tomonlama kartochka yasang: bir tomonda atama, ikkinchi tomonda ta'rif.",
            'items' => array_map(fn ($t) => [
                'term' => $t['upper'],
                'clue' => $t['translation'] !== '' ? $t['translation'] : $t['clue'],
            ], $pool),
        ];
    }

    // ---- 8) TAQQOSLASH VARAG'I (compare) -----------------------------------

    /**
     * Slaydlar ichidan birinchi "compare" tipdagisini topib, uning
     * left/right ma'lumotini ma'lumotnoma varag'i sifatida qaytaradi. Yangi
     * fakt so'ralmaydi — Gemini/curated tomonidan PPTX uchun allaqachon
     * generatsiya qilingan compare ma'lumoti qayta ishlatiladi. Mos slayd
     * topilmasa (mavzu taqqoslashga mos kelmasa), null qaytaradi.
     */
    private function compareBlock(array $slides): ?array
    {
        foreach ($slides as $slide) {
            if (! is_array($slide) || ($slide['body']['type'] ?? null) !== 'compare') {
                continue;
            }

            $compare = (array) ($slide['compare'] ?? []);
            $left = (array) ($compare['left'] ?? []);
            $right = (array) ($compare['right'] ?? []);

            $leftItems = array_values(array_filter((array) ($left['items'] ?? [])));
            $rightItems = array_values(array_filter((array) ($right['items'] ?? [])));

            if (empty($leftItems) || empty($rightItems)) {
                continue;
            }

            return [
                'type' => 'compare',
                'title' => 'Taqqoslash varag\'i',
                'instruction' => 'Ikki tomonni solishtiring.',
                'left' => ['heading' => (string) ($left['heading'] ?? ''), 'items' => $leftItems],
                'right' => ['heading' => (string) ($right['heading'] ?? ''), 'items' => $rightItems],
            ];
        }

        return null;
    }

    // ---- 9) GRAMMATIKA JADVALI (grammar) -----------------------------------

    /**
     * Chet tili darsi uchun (Gemini/curated tomonidan mavzu grammatik bo'lsa
     * to'ldirilgan) grammatika jadvali qatorlarini o'z holicha qaytaradi.
     * Mavzu grammatik emas bo'lsa (masalan lug'at mavzusi) qatorlar bo'sh
     * keladi — bu holda blok butunlay o'tkazib yuboriladi.
     */
    private function grammarBlock(array $rows): ?array
    {
        $clean = [];

        foreach ($rows as $r) {
            if (! is_array($r)) {
                continue;
            }

            $label = trim((string) ($r['label'] ?? ''));
            $structure = trim((string) ($r['structure'] ?? ''));
            $example = trim((string) ($r['example'] ?? ''));

            if ($label === '' || $structure === '' || $example === '') {
                continue;
            }

            $clean[] = ['label' => $label, 'structure' => $structure, 'example' => $example];
        }

        if (count($clean) < 2) {
            return null;
        }

        return [
            'type' => 'grammar',
            'title' => 'Grammatika jadvali',
            'instruction' => 'Qoidani va misolni o\'rganib chiq.',
            'rows' => $clean,
        ];
    }

    // ---- 10) YOZUV MASHQI (writing) — faqat boshlang'ich sinf --------------

    /**
     * Har atamani katta harflar bilan ko'rsatib, o'quvchi qo'lda ko'chirib
     * yozishi uchun (generator tomonida chiziqli qatorlar chiziladi). Yangi
     * fakt yo'q — faqat tekshirilgan atamalar ko'rsatiladi.
     */
    private function writingPracticeBlock(array $terms): ?array
    {
        $pool = array_slice($terms, 0, min(6, count($terms)));

        if (count($pool) < 3) {
            return null;
        }

        return [
            'type' => 'writing',
            'title' => 'Yozuv mashqi',
            'instruction' => "So'zni diqqat bilan o'qing, so'ng pastdagi chiziqlarga chiroyli qilib ko'chirib yozing.",
            'items' => array_map(fn ($t) => ['term' => $t['upper'], 'clue' => $t['clue']], $pool),
        ];
    }

    // ---- 11) SO'ZNI TO'LDIR (fillblank) — faqat boshlang'ich sinf ----------

    /**
     * Har atamaning 1-2 harfini (birinchi harfdan tashqari, u ko'rinib
     * tursin — mo'ljal beradi) bo'sh qoldiradi. Anagrammadan OSONROQ —
     * butun so'z emas, faqat bir-ikki harf yashiriladi.
     */
    private function fillBlankBlock(array $terms): ?array
    {
        $pool = array_slice($terms, 0, min(8, count($terms)));
        $items = [];

        foreach ($pool as $t) {
            $chars = $this->mbSplit($t['upper']);
            $len = count($chars);

            if ($len < 3) {
                continue;
            }

            $blankCount = $len <= 5 ? 1 : 2;
            $candidates = range(1, $len - 1);
            $this->shuffleInPlace($candidates);
            $blankPositions = array_slice($candidates, 0, min($blankCount, count($candidates)));

            $display = [];
            foreach ($chars as $i => $ch) {
                $display[] = ['letter' => $ch, 'blank' => in_array($i, $blankPositions, true)];
            }

            $items[] = ['term' => $t['upper'], 'clue' => $t['clue'], 'display' => $display];
        }

        if (count($items) < 4) {
            return null;
        }

        return [
            'type' => 'fillblank',
            'title' => "So'zni to'ldir",
            'instruction' => "Yetishmagan harflarni toping va bo'sh katakchalarga yozing.",
            'items' => $items,
        ];
    }

    // ---- Javoblar kaliti (o'qituvchi uchun) --------------------------------

    private function buildAnswerKey(array $games): array
    {
        $key = [];

        foreach ($games as $game) {
            if ($game['type'] === 'anagram') {
                $key[] = [
                    'title' => $game['title'],
                    'lines' => array_map(fn ($it) => $it['answer'], $game['items']),
                ];
            } elseif ($game['type'] === 'matching') {
                // Eslatma: "→" ataylab ishlatilmaydi — PDF'dagi Roboto shrifti
                // bu belgini chizmaydi, bo'sh katakcha (tofu) bo'lib chiqadi.
                $lines = [];
                foreach ($game['right'] as $r) {
                    $lines[] = "{$r['label']} ({$r['answer_number']})";
                }
                $key[] = ['title' => $game['title'], 'lines' => $lines];
            } elseif ($game['type'] === 'wordsearch') {
                $key[] = ['title' => $game['title'], 'lines' => $game['words']];
            } elseif ($game['type'] === 'crossword') {
                $lines = [];
                foreach ($game['across'] as $a) {
                    $lines[] = "{$a['number']}. {$a['answer']} (gorizontal)";
                }
                foreach ($game['down'] as $d) {
                    $lines[] = "{$d['number']}. {$d['answer']} (vertikal)";
                }
                $key[] = ['title' => $game['title'], 'lines' => $lines];
            } elseif ($game['type'] === 'sequence') {
                $lines = [];
                foreach ($game['items'] as $it) {
                    $lines[] = "{$it['label']} ({$it['correct_order']})";
                }
                $key[] = ['title' => $game['title'], 'lines' => $lines];
            } elseif ($game['type'] === 'truefalse') {
                $lines = [];
                foreach ($game['items'] as $it) {
                    $lines[] = "{$it['number']}. ".($it['answer'] ? 'T' : 'N');
                }
                $key[] = ['title' => $game['title'], 'lines' => $lines];
            } elseif ($game['type'] === 'fillblank') {
                $key[] = [
                    'title' => $game['title'],
                    'lines' => array_map(fn ($it) => $it['term'], $game['items']),
                ];
            }
        }

        return $key;
    }

    // ---- Yordamchilar ------------------------------------------------------

    private function alphabetOf(array $words): array
    {
        $set = [];
        foreach ($words as $w) {
            foreach ($this->mbSplit($w['upper']) as $ch) {
                $set[$ch] = true;
            }
        }

        $letters = array_keys($set);

        // Kamida biroz xilma-xillik uchun mavzu alifbosini kengaytiramiz.
        return count($letters) >= 8 ? $letters : array_merge($letters, $letters);
    }

    private function numberLabel(int $n): string
    {
        return (string) $n;
    }

    private function letterLabel(int $i): string
    {
        $letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

        return $letters[$i] ?? (string) ($i + 1);
    }

    private function shuffleInPlace(array &$arr): void
    {
        for ($i = count($arr) - 1; $i > 0; $i--) {
            $j = mt_rand(0, $i);
            [$arr[$i], $arr[$j]] = [$arr[$j], $arr[$i]];
        }
    }

    private function mbUpper(string $s): string
    {
        return mb_strtoupper($s, 'UTF-8');
    }

    private function mbLen(string $s): int
    {
        return mb_strlen($s, 'UTF-8');
    }

    /** @return array<int, string> */
    private function mbSplit(string $s): array
    {
        return mb_str_split($s, 1, 'UTF-8');
    }
}
