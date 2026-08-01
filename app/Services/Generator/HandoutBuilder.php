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
    public function build(string $topic, string $subjectName, string $themeKey, int $grade, int $duration, array $content): array
    {
        $terms = $this->cleanTerms((array) ($content['key_terms'] ?? []));

        $games = $this->buildGames($terms, (array) ($content['test_questions'] ?? []));

        return [
            'title' => $topic,
            'subjectName' => $subjectName,
            'theme' => $themeKey,
            'grade' => $grade,
            'duration' => $duration,
            'grade_band' => $grade <= 4 ? 'primary' : 'senior',
            'objective' => (string) ($content['objective_main'] ?? ''),
            'games' => $games,
            // O'qituvchi uchun javoblar kaliti — o'yinlarning yechimi.
            'answer_key' => $this->buildAnswerKey($games),
        ];
    }

    /**
     * @return array<int, array{term: string, upper: string, clue: string}>
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

            if ($clue === '' || ! preg_match('/^\p{L}{3,12}$/u', $term)) {
                continue;
            }

            $upper = $this->mbUpper($term);
            if (isset($seen[$upper])) {
                continue;
            }
            $seen[$upper] = true;

            $terms[] = ['term' => $term, 'upper' => $upper, 'clue' => $clue];
        }

        return $terms;
    }

    /**
     * O'yinlar to'plami. Har bir o'yin uchun yetarli atama bo'lmasa, u
     * o'yin o'tkazib yuboriladi (chala o'yin ko'rsatilmaydi).
     */
    private function buildGames(array $terms, array $questions): array
    {
        $games = [];

        // Takrorlanuvchanlik uchun urug'ni atamalardan hosil qilamiz — bir xil
        // dars har safar bir xil o'yin beradi (foydalanuvchi qayta yasasa
        // farqni ko'rmaydi, chalkashlik bo'lmaydi).
        mt_srand(crc32(implode('|', array_column($terms, 'upper'))) & 0x7fffffff);

        if (count($terms) >= 4) {
            $games[] = $this->anagramGame(array_slice($terms, 0, 6));
        }

        if (count($terms) >= 4) {
            $games[] = $this->matchingGame(array_slice($terms, 0, 6));
        }

        $wordSearch = $this->wordSearchGame($terms);
        if ($wordSearch !== null) {
            $games[] = $wordSearch;
        }

        $crossword = $this->crosswordGame($terms);
        if ($crossword !== null) {
            $games[] = $crossword;
        }

        mt_srand();

        return $games;
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
