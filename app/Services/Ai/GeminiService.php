<?php

namespace App\Services\Ai;

use App\Models\AiUsageLog;
use App\Models\Setting;
use App\Models\Subject;
use Illuminate\Support\Facades\Http;

class GeminiService
{
    /** call() muvaffaqiyatli bo'lgan so'rovda qaysi model/token statistikasi ishlatilganini eslab qoladi. */
    private ?string $lastUsedModel = null;

    private ?array $lastUsage = null;

    /** Muvaffaqiyatli so'rovda qaysi kalit ishlatilgani: personal_1/personal_2/shared. */
    private ?string $lastKeySource = null;

    private const LANGUAGE_NAMES = [
        'uz' => "o'zbek",
        'ru' => 'rus',
        'en' => 'ingliz',
    ];

    /**
     * Dars bosqichlari — nom va har bir davomiylik uchun maqsad qiymat.
     * 45 daqiqalik va 80 daqiqalik (juftlashtirilgan) darslar uchun ikki xil
     * taqsimot; ikkalasi ham o'z jamiga aniq teng.
     *
     * @return array<string, int>
     */
    private const PHASE_TARGETS_45 = [
        'Tashkiliy qism' => 2,
        "O'tilganni faollashtirish" => 8,
        'Yangi mavzu bayoni' => 15,
        'Mustahkamlash' => 15,
        'Jismoniy tarbiya daqiqasi' => 2,
        'Dars yakuni' => 3,
    ];

    private const PHASE_TARGETS_80 = [
        'Tashkiliy qism' => 3,
        "O'tilganni faollashtirish" => 12,
        'Yangi mavzu bayoni' => 25,
        'Mustahkamlash' => 25,
        'Jismoniy tarbiya daqiqasi' => 5,
        'Dars yakuni' => 10,
    ];

    private const LESSON_TYPES = [
        'Yangi bilim beruvchi dars',
        'Mustahkamlash darsi',
        'Aralash dars',
        'Amaliy (praktik) dars',
        'Takrorlash-umumlashtirish darsi',
        'Nazorat dars',
    ];

    /**
     * Kontent slaydlari soni. Sarlavha slaydi PresentationBuilder'da alohida
     * qo'shiladi, ya'ni tayyor taqdimot ANIQ 10 sahifa bo'ladi.
     */
    private const CONTENT_SLIDES = 9;

    /**
     * Modeldan bittata ZAXIRA slayd ko'proq so'raladi. Sababi: manbasiz
     * grafik yoki chala diagramma tozalashda tushib qolishi mumkin — zaxira
     * bo'lmasa bitta slayd yo'qolgani uchun BUTUN dars bekor bo'lardi
     * (kvota esa tor, har bir so'rov qimmat).
     */
    private const REQUEST_SLIDES = self::CONTENT_SLIDES + 1;

    /**
     * Tozalashdan keyin shundan kam slayd qolsa javob yaroqsiz deb hisoblanadi.
     * Undan yuqorisida dars quriladi — bitta slayd kam bo'lgani uchun
     * o'qituvchini butunlay materialsiz qoldirish noto'g'ri.
     */
    private const MIN_SLIDES = 7;

    /** Slayd maketlari — "chart"/"process"/"compare"/"cards"/"cycle" vizual maketlar. */
    private const SLIDE_TYPES = ['bullets', 'prose', 'process', 'compare', 'chart', 'cards', 'cycle'];

    /**
     * Chet tili fanlari — bularda key_terms so'zi tanlangan "dars tili"ga
     * qaramay chet tilining o'zida bo'ladi va o'zbekcha tarjimasi ham
     * so'raladi (tarjima kartochkalari uchun). "Ona tili" bu ro'yxatda YO'Q —
     * u chet tili emas, tarjima kerak emas.
     */
    private const TRANSLATABLE_LANGUAGE_SUBJECTS = ['Ingliz tili', 'Rus tili'];

    /**
     * @return array{
     *     objective_main: string,
     *     lesson_type: string,
     *     objectives: array{educational: string, developmental: string, upbringing: string},
     *     equipment: string[],
     *     phases: array<int, array{name: string, duration_min: int, content_html: string}>,
     *     homework: string,
     *     title_hook: string,
     *     title_meta: string[],
     *     slides: array<int, array<string, mixed>>,
     *     test_questions: array<int, array{text: string, options: string[], correct_index: int, explanation: string, difficulty: string}>,
     *     grammar_table: array<int, array{label: string, structure: string, example: string}>,
     * }
     *
     * @throws \RuntimeException
     */
    public function generateLessonContent(Subject $subject, int $grade, string $topic, int $duration, string $language, ?string $apiKey = null, ?string $apiKey2 = null, ?int $userId = null): array
    {
        $languageName = self::LANGUAGE_NAMES[$language] ?? "o'zbek";
        $subjectName = $subject->name_uz;
        $phaseTargets = $duration === 80 ? self::PHASE_TARGETS_80 : self::PHASE_TARGETS_45;
        $slideRange = ['min' => self::CONTENT_SLIDES, 'max' => self::CONTENT_SLIDES];

        // Mazmun manbasini tanlash nuqtasi.
        //   1) Qo'lda yozilgan material bo'lsa — o'sha (tez, kvotasiz, aniq).
        //   2) Bo'lmasa — AI.
        // Uchinchi yo'l (shablon generatori) ATAYLAB yo'q: uning "Misollar",
        // "... — 1-nuqta" kabi matni o'qituvchiga yetib borgan va materialni
        // yaroqsiz qilgan. Mavzu qamrab olinmagan bo'lsa AI javob berishi
        // yoki halol xato qaytarishi kerak — bo'sh shablon emas.
        // Claude API ulanganda shu yerga uchinchi tarmoq qo'shiladi.
        $data = (new CuratedContentGenerator)->find($topic, $language);
        $isCurated = $data !== null;

        if (! $isCurated) {
            $prompt = $this->buildPrompt($subjectName, $grade, $topic, $duration, $languageName, $phaseTargets, $slideRange);
            $data = $this->call($prompt, $apiKey, $apiKey2);

            // Har bir HAQIQIY Gemini so'rovi (curated emas) shu yerda qayd
            // etiladi — admin panelda o'qituvchining kunlik bepul kvotadan
            // necha foizini ishlatganini va umumiy (shared/.env) kvota
            // sarfini ko'rsatish uchun.
            if ($userId) {
                AiUsageLog::create([
                    'user_id' => $userId,
                    'provider' => 'gemini',
                    'key_source' => $this->lastKeySource,
                    'model' => $this->lastUsedModel,
                    'step' => 'lesson_generation',
                    'input_tokens' => $this->lastUsage['promptTokenCount'] ?? null,
                    'output_tokens' => $this->lastUsage['candidatesTokenCount'] ?? null,
                ]);
            }
        }

        if (! is_array($data) || empty($data['phases']) || empty($data['slides'])) {
            throw new \RuntimeException("AI javobini o'qib bo'lmadi. Qayta urinib ko'ring.");
        }

        $phases = $this->normalizePhases((array) $data['phases'], $duration, $phaseTargets);
        $slides = $this->normalizeSlides((array) ($data['slides'] ?? []), $isCurated);
        $questions = $this->normalizeQuestions((array) ($data['test_questions'] ?? []));
        $keyTerms = $this->normalizeKeyTerms((array) ($data['key_terms'] ?? []));
        $grammarTable = $this->normalizeGrammarTable((array) ($data['grammar_table'] ?? []));

        if (count($phases) === 0 || count($slides) < self::MIN_SLIDES || count($questions) < 10) {
            throw new \RuntimeException("AI javobi to'liq emas (bosqichlar/slaydlar/test savollari yetarli emas). Qayta urinib ko'ring.");
        }

        $objectives = (array) ($data['objectives'] ?? []);

        return [
            'objective_main' => (string) ($data['objective_main'] ?? ''),
            'lesson_type' => (string) ($data['lesson_type'] ?? self::LESSON_TYPES[0]),
            'objectives' => [
                'educational' => (string) ($objectives['educational'] ?? ''),
                'developmental' => (string) ($objectives['developmental'] ?? ''),
                'upbringing' => (string) ($objectives['upbringing'] ?? ''),
            ],
            'equipment' => array_values(array_filter(array_map('strval', (array) ($data['equipment'] ?? [])))),
            'phases' => $phases,
            'homework' => (string) ($data['homework'] ?? ''),
            'title_hook' => (string) ($data['title_hook'] ?? ''),
            'title_meta' => array_slice(array_values(array_filter(array_map('strval', (array) ($data['title_meta'] ?? [])))), 0, 3),
            'slides' => $slides,
            'test_questions' => $questions,
            'key_terms' => $keyTerms,
            'grammar_table' => $grammarTable,
        ];
    }

    /**
     * Tarqatma o'yinlari uchun atamalarni tozalaydi. O'yinlar (anagramma,
     * krossvord, so'z izlash) mexanik yasalgani uchun "term" qat'iy shaklda
     * bo'lishi kerak: bitta so'z, faqat harf. Shu shartga tushmaydigan
     * atamalar tashlanadi — chala grid chizishdan ko'ra kam atama yaxshi.
     *
     * @return array<int, array{term: string, clue: string}>
     */
    private function normalizeKeyTerms(array $rawTerms): array
    {
        $terms = [];
        $seen = [];

        foreach ($rawTerms as $t) {
            if (! is_array($t) || empty($t['term'])) {
                continue;
            }

            $term = trim((string) $t['term']);
            $clue = trim((string) ($t['clue'] ?? ''));
            $translation = trim((string) ($t['translation'] ?? ''));

            // Faqat harflardan iborat bitta so'z (Lotin yoki Kirill), 3-12 harf.
            // Apostrof/probel/chiziqchali atamalar grid o'yinlariga yaramaydi.
            if ($clue === '' || ! preg_match('/^\p{L}{3,12}$/u', $term)) {
                continue;
            }

            $key = mb_strtolower($term);
            if (isset($seen[$key])) {
                continue;
            }
            $seen[$key] = true;

            $terms[] = ['term' => $term, 'clue' => $clue, 'translation' => $translation];
        }

        return array_slice($terms, 0, 10);
    }

    /**
     * Grammatika jadvali qatorlarini tozalaydi (faqat chet tili darslarida
     * so'raladi, va faqat mavzu grammatik bo'lsa Gemini to'ldiradi — aks
     * holda bo'sh massiv keladi, bu normal holat).
     *
     * @return array<int, array{label: string, structure: string, example: string}>
     */
    private function normalizeGrammarTable(array $rawRows): array
    {
        $rows = [];

        foreach ($rawRows as $r) {
            if (! is_array($r)) {
                continue;
            }

            $label = trim((string) ($r['label'] ?? ''));
            $structure = trim((string) ($r['structure'] ?? ''));
            $example = trim((string) ($r['example'] ?? ''));

            if ($label === '' || $structure === '' || $example === '') {
                continue;
            }

            $rows[] = ['label' => $label, 'structure' => $structure, 'example' => $example];
        }

        return array_slice($rows, 0, 6);
    }

    private function buildPrompt(
        string $subjectName,
        int $grade,
        string $topic,
        int $duration,
        string $languageName,
        array $phaseTargets,
        array $slideRange,
    ): string {
        $phaseList = '';
        foreach ($phaseTargets as $name => $minutes) {
            $phaseList .= "- \"{$name}\" — {$minutes} daqiqa\n";
        }

        $lessonTypes = implode(', ', array_map(fn ($t) => "\"{$t}\"", self::LESSON_TYPES));

        $slideCount = self::REQUEST_SLIDES;
        $totalPages = self::CONTENT_SLIDES + 1;

        $isLanguageSubject = in_array($subjectName, self::TRANSLATABLE_LANGUAGE_SUBJECTS, true);

        $keyTermsExtra = $isLanguageSubject
            ? "\n   - BU CHET TILI DARSI: \"term\" albatta shu chet tilining o'zidagi so'z bo'lsin (masalan Ingliz tili bo'lsa \"apple\"), tanlangan dars tiliga QARAMAY — bu yerda yuqoridagi \"BARCHA kontent {$languageName} tilida\" qoidasidan MUSTASNO. Qo'shimcha \"translation\" maydoniga shu so'zning ANIQ o'zbekcha tarjimasini yoz (masalan \"olma\") — o'quvchilar uchun tarjima kartochkalari shundan yasaladi, tarjima xato bo'lmasin."
            : '';

        $keyTermsExample = $isLanguageSubject
            ? '{"term": "...", "clue": "...", "translation": "..."}'
            : '{"term": "...", "clue": "..."}';

        $grammarSection = $isLanguageSubject
            ? "\n\n10. \"grammar_table\" — FAQAT agar \"{$topic}\" mavzusining o'zi grammatik qoida/tuzilma bo'lsa (masalan fe'l zamoni, artikl, sifat darajalari, modal fe'l, gap tuzilishi) to'ldir: 3-6 qator, har biri {\"label\": \"qisqa shakl nomi (masalan 'I / You / We / They' yoki 'Ijobiy gap')\", \"structure\": \"tuzilma/formula (masalan 'Subject + V1')\", \"example\": \"to'liq, grammatik jihatdan to'g'ri gap misoli, {$languageName} tilida\"}. Mavzu grammatik qoida EMAS (masalan so'z boyligi/lug'at, madaniyat mavzusi) bo'lsa — bo'sh massiv \"[]\" qaytar, mos kelmaydigan jadval o'ylab topma."
            : '';

        $grammarJsonField = $isLanguageSubject
            ? ",\n  \"grammar_table\": [\n    {\"label\": \"...\", \"structure\": \"...\", \"example\": \"...\"}\n  ]"
            : '';

        return <<<PROMPT
Sen tajribali, o'quvchilarni qiziqtira oladigan {$subjectName} o'qituvchisisan. {$grade}-sinf o'quvchilari uchun "{$topic}" mavzusida {$duration} daqiqalik bitta darsga to'liq, rasmiy dars ishlanmasi (konspekt) darajasidagi material tayyorla.

MUHIM: quyidagi ko'rsatmalar shu tilda (o'zbek tilida) yozilgan, lekin javobingdagi BARCHA kontent (matnlar, savollar, slaydlar) {$languageName} tilida bo'lishi SHART.

<user_topic>{$topic}</user_topic>

=== MAZMUN SIFATI — ENG MUHIM TALAB ===
Bu materialni haqiqiy o'qituvchi haqiqiy sinfda ishlatadi. Shuning uchun:
- Har bir jumla ANIQ ma'lumot bersin: ta'rif, raqam, sana, nom, formula, kod, qoida yoki misol.
- Bo'sh, umumiy iboralar QAT'IYAN TAQIQLANADI. Masalan: "asosiy tushunchalar", "bu mavzu muhim ahamiyatga ega", "1-nuqta", "mavzuning mohiyati tushuntiriladi" kabi hech narsa o'rgatmaydigan gaplar yozma.
- Har bir tushunchadan keyin DARHOL konkret misol kel — hayotdan olingan yoki fanning o'zidan.
- {$grade}-sinf o'quvchisi tushunadigan tilda yoz, lekin mazmunni bo'shatib yuborma: o'quvchi darsdan yangi, aniq bilim bilan chiqsin.
- Mavzuga oid qiziqarli fakt, tarixiy tafsilot yoki amaliy qo'llanishni qo'sh — o'quvchi esda saqlab qoladigan narsa bo'lsin.
- Faqat "nima" bilan cheklanma — HAR bir asosiy tushuncha uchun "nega shunday" yoki "qanday ishlaydi" darajasida bitta qo'shimcha jumla qo'sh (sabab-oqibat, mexanizm yoki qo'llanish). Ta'rifni takrorlash emas, undan bir qadam chuqurroq bor.

=== ANIQLIK — BUZILMASLIGI SHART ===
- Faqat ROSTLIGIGA ISHONCHING KOMIL bo'lgan ma'lumotni yoz.
- Raqam, sana, statistika, ism yoki manba — aniq bilmasang, UMUMAN yozma. Taxminiy raqam "o'ylab topish" bu yerdagi eng og'ir xato.
- Formula, kod, sintaksis va qoidalar xatosiz bo'lsin — o'quvchi ularni yod oladi.
- Ishonching komil bo'lmagan tafsilotni yozish o'rniga, o'sha joyni ishonchli, tekshirilgan mazmun bilan to'ldir.
- Javobingda O'Z MULOHAZANG yoki o'z-o'zingni tuzatishing BO'LMASIN. "(yo'q, bu noto'g'ri, o'zgartiraman)", "masalan ... (aslida bu boshqa turga kiradi)" kabi izohlar to'g'ridan-to'g'ri slaydga tushib, materialni buzadi. Misolni yozishdan OLDIN tekshir va faqat yakuniy, to'g'ri variantni yoz.

Quyidagi tuzilmani to'ldir:

1. "lesson_type" — dars turi, quyidagilardan biri: {$lessonTypes}. Mavzuga eng mos turini tanla.

2. "objective_main" — darsning umumiy maqsadi, 1 gap.

3. "objectives" — 3 ta aniq maqsad (post-sovet/o'zbek pedagogik "3 maqsad" konventsiyasi):
   - "educational" (ta'limiy): o'quvchi shu darsdan qanday bilim/ko'nikma oladi
   - "developmental" (rivojlantiruvchi): qanday fikrlash/amaliy ko'nikma rivojlanadi
   - "upbringing" (tarbiyaviy): qanday qadriyat/munosabat shakllanadi
   Har biri 1 gap.

4. "equipment" — darsda kerak bo'ladigan jihoz/vosita/material ro'yxati, 2-5 ta qisqa element (masalan: "Darslik", "Doska", "Sxema/jadval", "Tarqatma materiallar").

5. "phases" — darsning borishi, ANIQ 6 ta bosqich, ANIQ shu tartibda va shu nomlar bilan:
{$phaseList}
   Har bir bosqich uchun "duration_min" — yuqoridagi son (mumkin qadar aniq shunga yaqin bo'lsin, chunki bosqichlar jami {$duration} daqiqaga teng bo'lishi SHART).
   Har bir bosqich uchun "content_html" — shu bosqichda o'qituvchi aynan nima qiladi/aytadi, HTML formatida (<p>, <ul><li>, <ol><li>, <b> teglaridan foydalan, boshqa teg yo'q):
   - "Tashkiliy qism": salomlashish, davomatni tekshirish, diqqatni jalb qiluvchi qisqa kirish/topishmoq
   - "O'tilganni faollashtirish": oldingi mavzuga bog'liq savollar, miya to'foni (nima bilishlarini eslash)
   - "Yangi mavzu bayoni": ENG BOY QISM — mavzuning asosiy tushunchalarini raqamlangan ro'yxat sifatida, har biriga ANIQ ta'rif va KONKRET misol bilan tushuntir (kamida 3-5 ta tushuncha/qism), <b> bilan kalit atamalarni ajrat
   - "Mustahkamlash": 2-3 ta KONKRET amaliy mashq/topshiriq, aniq tavsiflangan (shunchaki "mashq qiling" emas — mashqning o'zini yoz)
   - "Jismoniy tarbiya daqiqasi": mavzu bilan bog'liq qisqa harakatli o'yin/assotsiatsiya (masalan, tushuncha aytilganda mos harakat qilish); agar mavzu juda mavhum bo'lib harakatli o'yin mantiqsiz tuyulsa, buning o'rniga diqqatni tetiklashtiruvchi qisqa faollik taklif qil (zo'rma-zo'raki bo'lmasin)
   - "Dars yakuni": mavzuni mustahkamlovchi 2-3 ta yakuniy savol, qisqa xulosa, baholash bo'yicha izoh

6. "homework" — uyga vazifa, aniq va bajarilishi mumkin bo'lgan tavsif, 1-2 gap.

7. Taqdimot (prezentatsiya) uchun:
   - "title_hook" — sarlavha slaydi uchun bitta jozibali, qiziqtiruvchi gap (mavzuning mohiyatini ochadigan)
   - "title_meta" — sarlavha slaydi pastidagi kichik metama'lumot qatori uchun 2-3 ta juda qisqa, mavzuga oid faktik parcha (masalan sana, joy, muhim raqam — mavzuga mos bo'lsa)
   - "slides" — ANIQ {$slideCount} ta kontent slaydi (sarlavha slaydi dasturda alohida qo'shiladi, jami {$totalPages} sahifa bo'ladi). Kam ham, ko'p ham emas — ANIQ {$slideCount} ta.

   Slaydlar mana shu rivojlanish bo'yicha qurilsin. 2-, 5-, 6- va 8-slaydlarning MAKETI QAT'IY BELGILANGAN — ular diagramma sifatida chiziladi:
     1   — mavzuga kirish: bu nima va nima uchun kerak, qanday savolga javob beradi
     2   — mavzuning asosiy tushuncha/atamalari BIR QARASHDA  →  "body.type" ANIQ "cards" BO'LSIN va "cards" to'ldirilsin (3-4 ta atama, har birida qisqa ta'rif)
     3-4 — eng muhim 1-2 tushunchani CHUQUR ochish, aniq ta'rif + konkret misol
     5   — yana bir guruh o'zaro bog'liq tushuncha/tur/xususiyat  →  "body.type" ANIQ "cards" BO'LSIN va "cards" to'ldirilsin (3-4 ta karta)
     6   — bosqichma-bosqich tartib yoki algoritm  →  "body.type" ANIQ "process" BO'LSIN va "steps" to'ldirilsin.
            AGAR bu jarayon TAKRORLANUVCHI, yopiq halqa bo'lsa (masalan tabiatdagi aylanishlar, hayot sikli, qayta aloqa halqasi, fasllar) — "process" o'rniga "cycle" tanla va xuddi shu "steps"ni to'ldir.
     7   — amaliy qo'llanish yoki to'liq ishlangan misol (masala yechimi, kod, tahlil, tajriba)
     8   — ikki narsani taqqoslash (turlari, usullari, oldin/keyin, to'g'ri/noto'g'ri)  →  "body.type" ANIQ "compare" BO'LSIN va "compare" to'ldirilsin
     9   — qiziqarli faktlar, tarix yoki mavzuning real hayot bilan bog'liqligi
     10  — xulosa: eslab qolish kerak bo'lgan 3-5 ta kalit fikr

   Bu 4 ta diagramma slaydsiz (2, 5, 6, 8) taqdimot faqat matn bo'lib qoladi — bu TALABNI BUZISH hisoblanadi.
   "cards" atamalari BITTA- IKKITA so'zli sarlavha (atama nomi) + 1 gaplik qisqa ta'rif bo'lsin — uzun jumla YOZMA (kartaga sig'maydi).
   "cards", "process", "cycle", "compare" slaydlarida "body.paragraphs" BO'SH bo'lsa ham bo'ladi — mazmun o'z maydonida ("cards"/"steps"/"compare") keladi. Matnli slaydlarda (bullets/prose) esa "body.paragraphs" to'ldirilsin.

   Har bir slaydda:
   - "title" — SHU slaydga xos, ANIQ va jonli sarlavha. "Kirish", "1-qism", "Asosiy tushunchalar", "Xulosa" kabi umumiy sarlavhalar TAQIQLANADI — sarlavhaning o'zi mazmunni aytib tursin.
   - "notes" — o'qituvchi uchun 1-2 gap izoh: shu slaydni qanday tushuntirish, sinfga qanday savol berish.
   - "body.type" — quyidagi turlardan mazmunga eng mosini tanla (2/5/6/8-slaydlar uchun yuqorida QAT'IY belgilangan):

     "cards"   — bir necha o'zaro bog'liq atama/tur/xususiyat, har biri qisqa ta'rif bilan (kartochkalar to'ri)
     "cycle"   — takrorlanuvchi, yopiq halqa jarayon (tabiatdagi aylanishlar, hayot sikli, qayta aloqa)
     "process" — bosqichma-bosqich jarayon: algoritm, tartib, bajarish ketma-ketligi (chiziqli, halqasiz)
     "compare" — ikki narsani taqqoslash: afzallik/kamchilik, oldin/keyin, ikki usul farqi
     "bullets" — 3-6 ta qisqa, har biri aniq ma'lumot beruvchi punkt
     "prose"   — 1-2 ta qisqa paragraf (hikoya, tavsif, tarixiy voqea uchun)

   DIAGRAMMA/GRAFIK haqida: raqamli diagramma (foiz, ulush, statistika) SO'RALMAYDI va uni yasashga urinma. "Tilda necha foiz uchraydi", "foydalanuvchilarning necha foizi" kabi taxminiy sonlar deyarli har doim noto'g'ri bo'ladi va dars materialini yaroqsiz qiladi. Vizual xilma-xillik "cards", "cycle", "process" va "compare" orqali beriladi — ular son talab qilmaydi.

   Turga qarab qo'shimcha maydonlar:
   - "bullets"/"prose" uchun: "body.paragraphs" — bullets bo'lsa 4-6 ta qisqa punkt (har biri to'liq, konkret fikr — 3 tadan kam yozma), prose bo'lsa 2 ta paragraf (har biri 2-3 gap, ikkinchisi birinchisidan chuqurroq/misolli bo'lsin)
   - "cards" uchun: "cards" — 3-4 ta karta, har biri {"title": "atama (1-2 so'z)", "desc": "1 gaplik qisqa ta'rif"}
   - "process"/"cycle" uchun: "steps" — 3-5 ta qadam (cycle uchun 3-6), har biri {"title": "qadam nomi (2-4 so'z)", "detail": "1 gap izoh"}
   - "compare" uchun: "compare" — {"left": {"heading": "...", "items": ["...", "..."]}, "right": {"heading": "...", "items": ["...", "..."]}}, har tomonda 2-5 ta qisqa punkt

   Slaydlar birgalikda "Yangi mavzu bayoni" va "Mustahkamlash" bosqichlaridagi mazmunni qamrab olsin, lekin slaydga sig'adigan hajmda bo'lsin — katta matn devori YARATMA.

8. "test_questions" — shu mavzu bo'yicha 28-30 ta test savoli (taxminan 12 ta "oson", 10 ta "orta", 6-8 ta "qiyin"). Har birida ANIQ 4 ta variant, faqat bittasi to'g'ri ("correct_index" — 0 dan 3 gacha), qisqa "explanation" (nega to'g'ri javob shu), va "difficulty" ("oson"/"orta"/"qiyin").

9. "key_terms" — shu mavzuning ENG MUHIM 8-10 ta atamasi. Bulardan tarqatma materialdagi o'yinlar (anagramma, krossvord, so'z izlash) YASALADI, shuning uchun QAT'IY qoidalar:
   - "term" — BITTA so'z bo'lsin ( probel, chiziqcha, apostrof YO'Q). Masalan "controls", "atribut", "brauzer". Ko'p so'zli ibora YOZMA.
   - "term" faqat harflardan iborat bo'lsin (raqam, belgi yo'q). 3-12 harf orasida.
   - "clue" — o'sha atamaga ANIQ ishora qiluvchi qisqa savol yoki ta'rif (1 gap), lekin atamaning O'ZINI ichida takrorlamasin (aks holda javob ochilib qoladi).
   - Atamalar mavzuning asosiy tushunchalari bo'lsin — o'quvchi darsdan bilib chiqishi kerak bo'lgan so'zlar.{$keyTermsExtra}{$grammarSection}

Javobni FAQAT quyidagi JSON shakliga ANIQ mos formatda qaytar, boshqa hech qanday matn (izoh, markdown ```json belgisi va h.k.) yozma:

{
  "lesson_type": "...",
  "objective_main": "...",
  "objectives": {"educational": "...", "developmental": "...", "upbringing": "..."},
  "equipment": ["...", "..."],
  "phases": [
    {"name": "...", "duration_min": 0, "content_html": "..."}
  ],
  "homework": "...",
  "title_hook": "...",
  "title_meta": ["...", "..."],
  "slides": [
    {"title": "...", "notes": "...", "body": {"type": "prose", "paragraphs": ["...", "..."]}},
    {"title": "...", "notes": "...", "body": {"type": "cards"}, "cards": [{"title": "...", "desc": "..."}, {"title": "...", "desc": "..."}, {"title": "...", "desc": "..."}]},
    {"title": "...", "notes": "...", "body": {"type": "bullets", "paragraphs": ["...", "...", "..."]}},
    {"title": "...", "notes": "...", "body": {"type": "process"}, "steps": [{"title": "...", "detail": "..."}, {"title": "...", "detail": "..."}, {"title": "...", "detail": "..."}]},
    {"title": "...", "notes": "...", "body": {"type": "compare"}, "compare": {"left": {"heading": "...", "items": ["...", "..."]}, "right": {"heading": "...", "items": ["...", "..."]}}}
  ],
  "test_questions": [
    {"text": "...", "options": ["...", "...", "...", "..."], "correct_index": 0, "explanation": "...", "difficulty": "oson"}
  ],
  "key_terms": [
    {$keyTermsExample},
    {$keyTermsExample}
  ]{$grammarJsonField}
}
PROMPT;
    }

    /**
     * Gemini javobidan olingan bosqichlarni tozalaydi va davomiylikni
     * $totalDuration'ga ANIQ teng bo'lguncha proporsional miqyoslaydi —
     * modelning noaniq sonlarini rad etish o'rniga tuzatib ishlatamiz.
     *
     * @return array<int, array{name: string, duration_min: int, content_html: string}>
     */
    private function normalizePhases(array $rawPhases, int $totalDuration, array $phaseTargets): array
    {
        $phases = [];
        foreach ($rawPhases as $p) {
            if (! is_array($p) || empty($p['name']) || empty($p['content_html'])) {
                continue;
            }

            $phases[] = [
                'name' => (string) $p['name'],
                'duration_min' => max(1, (int) ($p['duration_min'] ?? 1)),
                'content_html' => (string) $p['content_html'],
            ];
        }

        if (count($phases) === 0) {
            return [];
        }

        // Agar model bosqichlar sonini buzsa (6 tadan farq qilsa), maqsadli
        // nomlar bilan qayta moslashtiramiz — mavjudlarni tartib bo'yicha ishlatib,
        // yetishmasa bo'sh (lekin halol) bosqich bilan to'ldiramiz.
        $targetNames = array_keys($phaseTargets);
        if (count($phases) !== count($targetNames)) {
            $rebuilt = [];
            foreach ($targetNames as $i => $name) {
                $rebuilt[] = $phases[$i] ?? [
                    'name' => $name,
                    'duration_min' => $phaseTargets[$name],
                    'content_html' => '<p>—</p>',
                ];
                $rebuilt[$i]['name'] = $name;
            }
            $phases = $rebuilt;
        }

        $sum = array_sum(array_column($phases, 'duration_min'));

        if ($sum === $totalDuration) {
            return $phases;
        }

        $scaled = [];
        $runningSum = 0;
        foreach ($phases as $p) {
            $minutes = max(1, (int) round($p['duration_min'] * $totalDuration / $sum));
            $scaled[] = $minutes;
            $runningSum += $minutes;
        }

        $diff = $totalDuration - $runningSum;
        if ($diff !== 0) {
            $maxIndex = array_keys($scaled, max($scaled), true)[0];
            $scaled[$maxIndex] = max(1, $scaled[$maxIndex] + $diff);
        }

        foreach ($phases as $i => &$p) {
            $p['duration_min'] = $scaled[$i];
        }
        unset($p);

        return $phases;
    }

    /**
     * Slaydlarni tozalaydi. Vizual maketlarda ("chart"/"process"/"compare")
     * "paragraphs" bo'lmasligi normal — mazmun o'z maydonida keladi, shuning
     * uchun bu yerda faqat maydonlar shakli tekshiriladi. Ma'lumot chala
     * bo'lsa PresentationBuilder slaydni matnli maketga tushiradi.
     *
     * @return array<int, array<string, mixed>>
     */
    private function normalizeSlides(array $rawSlides, bool $isCurated): array
    {
        $slides = [];

        foreach ($rawSlides as $s) {
            if (! is_array($s) || empty($s['title'])) {
                continue;
            }

            $type = (string) ($s['body']['type'] ?? 'bullets');
            if (! in_array($type, self::SLIDE_TYPES, true)) {
                $type = 'bullets';
            }

            $paragraphs = array_values(array_filter(array_map(
                'strval',
                (array) ($s['body']['paragraphs'] ?? [])
            )));

            $slide = [
                'title' => (string) $s['title'],
                'notes' => (string) ($s['notes'] ?? ''),
                'body' => [
                    'type' => $type,
                    'paragraphs' => $paragraphs,
                ],
            ];

            $slide += $this->normalizeVisual($type, $s, $isCurated);

            $hasVisual = isset($slide['chart']) || isset($slide['steps']) || isset($slide['compare']) || isset($slide['cards']);

            // Paragraflar ham, vizual ma'lumot ham bo'lmasa — ko'rsatadigan narsa yo'q.
            if ($paragraphs === [] && ! $hasVisual) {
                continue;
            }

            $slides[] = $slide;
        }

        return array_slice($slides, 0, self::CONTENT_SLIDES);
    }

    /**
     * Vizual maketning qo'shimcha maydonini ("chart"/"steps"/"compare")
     * shakl bo'yicha tozalaydi; mos maydon yo'q bo'lsa bo'sh massiv qaytaradi.
     *
     * @return array<string, mixed>
     */
    private function normalizeVisual(string $type, array $s, bool $isCurated): array
    {
        if ($type === 'chart') {
            // AI GENERATSIYA QILGAN GRAFIK CHIZILMAYDI.
            //
            // Sabab amaliyotdan: prompt "taxminiy statistika yozma" desa ham,
            // model "склонений: 50% / 35% / 15%" kabi raqamlarni o'ylab topib,
            // ustiga haqiqiy lug'at nomini manba qilib yozdi — ya'ni manba
            // talabi soxta raqamni to'sa olmadi. Dars materialida noto'g'ri
            // son ko'rsatish grafiksiz slayddan ancha yomon.
            //
            // Grafik faqat qo'lda yozilgan (raqamlari tekshirilgan)
            // materiallarda ishlatiladi. AI slaydlari "process"/"compare"
            // diagrammalari bilan vizual bo'ladi — ular son talab qilmaydi.
            if (! $isCurated) {
                return [];
            }

            $chart = (array) ($s['chart'] ?? []);
            $data = [];

            foreach ((array) ($chart['data'] ?? []) as $point) {
                if (is_array($point) && isset($point['label'], $point['value']) && is_numeric($point['value'])) {
                    $data[] = [
                        'label' => (string) $point['label'],
                        'value' => (float) $point['value'],
                    ];
                }
            }

            // Manbasi ko'rsatilmagan grafik CHIZILMAYDI. Amaliyotda model
            // "foydalanish chastotasi 52% / 38% / 10%" kabi tekshirib
            // bo'lmaydigan raqamlarni o'ylab topib qo'ydi — manba talabi shu
            // turdagi soxta statistikani kesib tashlaydi, slayd esa matnli
            // maketga tushadi (PresentationBuilder).
            if (count($data) < 2 || trim((string) ($chart['source'] ?? '')) === '') {
                return [];
            }

            return ['chart' => [
                'kind' => ($chart['kind'] ?? 'bar') === 'pie' ? 'pie' : 'bar',
                'title' => (string) ($chart['title'] ?? ''),
                'series_name' => (string) ($chart['series_name'] ?? ''),
                'source' => (string) $chart['source'],
                'caption' => (string) ($chart['caption'] ?? ''),
                'data' => $data,
            ]];
        }

        if ($type === 'process' || $type === 'cycle') {
            $steps = [];

            foreach ((array) ($s['steps'] ?? []) as $step) {
                if (is_array($step) && ! empty($step['title'])) {
                    $steps[] = [
                        'title' => (string) $step['title'],
                        'detail' => (string) ($step['detail'] ?? ''),
                    ];
                }
            }

            return count($steps) >= 3 ? ['steps' => $steps] : [];
        }

        if ($type === 'cards') {
            $cards = [];

            foreach ((array) ($s['cards'] ?? []) as $card) {
                if (is_array($card) && ! empty($card['title'])) {
                    $cards[] = [
                        'title' => (string) $card['title'],
                        'desc' => (string) ($card['desc'] ?? ''),
                    ];
                }
            }

            return count($cards) >= 2 ? ['cards' => array_slice($cards, 0, 6)] : [];
        }

        if ($type === 'compare') {
            $compare = (array) ($s['compare'] ?? []);
            $sides = [];

            foreach (['left', 'right'] as $side) {
                $data = (array) ($compare[$side] ?? []);
                $items = array_values(array_filter(array_map('strval', (array) ($data['items'] ?? []))));

                if (empty($data['heading']) || count($items) < 2) {
                    return [];
                }

                $sides[$side] = [
                    'heading' => (string) $data['heading'],
                    'items' => $items,
                ];
            }

            return ['compare' => $sides];
        }

        return [];
    }

    /**
     * @return array<int, array{text: string, options: string[], correct_index: int, explanation: string, difficulty: string}>
     */
    private function normalizeQuestions(array $rawQuestions): array
    {
        $questions = [];
        foreach ($rawQuestions as $q) {
            if (
                is_array($q)
                && isset($q['text'], $q['options'], $q['correct_index'])
                && is_array($q['options'])
                && count($q['options']) === 4
                && is_int($q['correct_index'])
                && $q['correct_index'] >= 0
                && $q['correct_index'] <= 3
            ) {
                $difficulty = in_array($q['difficulty'] ?? null, ['oson', 'orta', 'qiyin'], true)
                    ? $q['difficulty']
                    : 'orta';

                $questions[] = [
                    'text' => (string) $q['text'],
                    'options' => array_map('strval', array_values($q['options'])),
                    'correct_index' => $q['correct_index'],
                    'explanation' => (string) ($q['explanation'] ?? ''),
                    'difficulty' => $difficulty,
                ];
            }
        }

        return $questions;
    }

    /**
     * MUHIM (amaliyotdan chiqqan xulosa): dastlab Gemini'ning "responseSchema"
     * (structured output) imkoniyati orqali API darajasida shakl kafolati
     * berishga urinildi, lekin "slides" va "test_questions" kabi ikkita katta,
     * chuqur ichma-ich massiv sxemasi BIRGALIKDA yuborilganda API 400
     * ("Request contains an invalid argument") xato qaytardi — ikkalasi
     * alohida yuborilganda muammo yo'q, demak bu hujjatlashtirilmagan
     * murakkablik chegarasi. Shu sababli JSON shakli faqat prompt orqali
     * (pastdagi aniq namuna bilan) belgilanadi, xuddi eski koddagi kabi —
     * va quyidagi normalize*() metodlari noto'g'ri/yetishmayotgan
     * maydonlarni filtrlab, halol tarzda qayta ishlaydi.
     */
    private function call(string $prompt, ?string $apiKey = null, ?string $apiKey2 = null): mixed
    {
        // Ustunlik tartibi — har biri ALOHIDA Google akkauntiga (demak alohida
        // kunlik kvotaga) tegishli, shuning uchun biri tugasa avtomatik
        // keyingisiga o'tiladi:
        //   1) o'qituvchining birinchi shaxsiy kaliti
        //   2) o'qituvchining ikkinchi (zaxira) shaxsiy kaliti
        //   3) admin panel > Sozlamalar'dagi umumiy kalit, bo'lmasa .env'dagi
        //      GEMINI_API_KEY (bular ikkalasi ham BITTA "shared" kvota
        //      sifatida hisoblanadi — Sozlamalar bo'sh bo'lsa .env ishlatiladi,
        //      ikkalasi birga sinalmaydi).
        $sharedOrEnvKey = Setting::get('gemini_api_key') ?: config('services.gemini.key');

        $candidates = [];
        if ($apiKey) {
            $candidates[] = ['key' => $apiKey, 'source' => 'personal_1'];
        }
        if ($apiKey2) {
            $candidates[] = ['key' => $apiKey2, 'source' => 'personal_2'];
        }
        if ($sharedOrEnvKey) {
            $candidates[] = ['key' => $sharedOrEnvKey, 'source' => 'shared'];
        }

        if (empty($candidates)) {
            throw new \RuntimeException("Gemini API kaliti sozlanmagan. Admin panel > Sozlamalar bo'limidan kiriting.");
        }

        // Asosiy modelning bepul kvotasi KUNLIK va tor — u tugaganda dars
        // generatsiyasi butunlay to'xtab qolmasligi uchun zaxira modelga
        // o'tiladi (uning kvotasi alohida hisoblanadi).
        $models = array_values(array_unique(array_filter([
            config('services.gemini.model', 'gemini-flash-latest'),
            config('services.gemini.fallback_model'),
        ])));

        $lastError = null;

        foreach ($candidates as $candidate) {
            foreach ($models as $model) {
                $response = Http::timeout(180)->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$candidate['key']}",
                    [
                        'contents' => [
                            ['parts' => [['text' => $prompt]]],
                        ],
                        'generationConfig' => [
                            'response_mime_type' => 'application/json',
                            // Past temperatura — faktik aniqlik ijodkorlikdan muhimroq
                            // (o'ylab topilgan sana/statistika eng og'ir xato).
                            'temperature' => 0.55,
                            // 9 ta boy slayd + 6 bosqich + 30 test savoli 16k'ga sig'may,
                            // javob yarim kesilib qolardi (finishReason: MAX_TOKENS).
                            'maxOutputTokens' => 32768,
                        ],
                    ]
                );

                if ($response->status() === 429) {
                    // Shu kalitning kvotasi tugagan — keyingi model, keyin
                    // keyingi kalit sinaladi.
                    $lastError = 'quota';

                    continue;
                }

                if (! $response->successful()) {
                    throw new \RuntimeException(
                        'AI xizmati xatosi: '.($response->json('error.message') ?? $response->body())
                    );
                }

                $text = $response->json('candidates.0.content.parts.0.text');

                if (! $text) {
                    $finishReason = $response->json('candidates.0.finishReason');
                    throw new \RuntimeException(
                        "AI bo'sh javob qaytardi (finishReason: {$finishReason}). Qayta urinib ko'ring."
                    );
                }

                $this->lastUsedModel = $model;
                $this->lastUsage = $response->json('usageMetadata');
                $this->lastKeySource = $candidate['source'];

                return json_decode($text, true);
            }
        }

        if ($lastError === 'quota') {
            throw new \RuntimeException(
                "AI xizmatining bugungi bepul limiti tugadi (barcha ulangan kalitlar). Ertaga qayta urinib ko'ring yoki yangi API kalit ulang."
            );
        }

        throw new \RuntimeException("AI xizmatiga ulanib bo'lmadi. Qayta urinib ko'ring.");
    }
}
