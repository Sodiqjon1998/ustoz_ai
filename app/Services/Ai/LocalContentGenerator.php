<?php

namespace App\Services\Ai;

/**
 * Gemini API'ga bog'liq bo'lmagan, shablon asosidagi kontent generatori.
 * Haqiqiy AI sifatidagi material bermaydi — GeminiService bilan bir xil
 * JSON strukturasini qaytarib, butun quvur liniyasini (DOCX/PPTX/PDF
 * generatsiya, yuklab olish) tarmoq/kvota xatolarisiz sinash imkonini beradi.
 */
class LocalContentGenerator
{
    private const LABELS = [
        'uz' => [
            'objective' => 'mavzusini {grade}-sinf o\'quvchilariga tushuntirish va amaliyotda qo\'llash ko\'nikmasini shakllantirish',
            'educational' => "O'quvchi {topic} mavzusining asosiy tushunchalarini biladi va tushuntira oladi.",
            'developmental' => "O'quvchida mantiqiy fikrlash va mustaqil xulosa chiqarish ko'nikmasi rivojlanadi.",
            'upbringing' => "O'quvchida fanga va bilimga nisbatan qiziqish va mas'uliyat tarbiyalanadi.",
            'equipment' => ['Darslik', 'Doska', 'Tarqatma materiallar', 'Proyektor'],
            'homework' => "{topic} mavzusi bo'yicha darslikdan mos mashqlarni bajaring va asosiy tushunchalarni daftaringizga yozib qo'ying.",
            'hook' => "Bugun biz {topic} bilan tanishamiz — bu mavzu {subject} fanida juda muhim o'rin tutadi.",
        ],
        'ru' => [
            'objective' => 'познакомить учащихся {grade} класса с темой и сформировать навык практического применения',
            'educational' => 'Учащийся понимает и может объяснить основные понятия темы.',
            'developmental' => 'У учащегося развивается логическое мышление и умение делать самостоятельные выводы.',
            'upbringing' => 'У учащегося воспитывается интерес к предмету и ответственность.',
            'equipment' => ['Учебник', 'Доска', 'Раздаточный материал', 'Проектор'],
            'homework' => 'Выполните соответствующие упражнения из учебника по теме и запишите основные понятия в тетрадь.',
            'hook' => 'Сегодня мы знакомимся с темой — она занимает важное место в предмете {subject}.',
        ],
        'en' => [
            'objective' => 'introduce grade {grade} students to the topic and build practical application skills',
            'educational' => 'Students understand and can explain the core concepts of the topic.',
            'developmental' => 'Students develop logical thinking and independent reasoning skills.',
            'upbringing' => 'Students develop interest in and responsibility toward the subject.',
            'equipment' => ['Textbook', 'Whiteboard', 'Handouts', 'Projector'],
            'homework' => 'Complete the related exercises from the textbook and write down the key concepts in your notebook.',
            'hook' => 'Today we explore this topic — an important part of {subject}.',
        ],
    ];

    public function generate(
        string $subjectName,
        int $grade,
        string $topic,
        int $duration,
        string $language,
        array $phaseTargets,
        array $slideRange,
    ): array {
        $l = self::LABELS[$language] ?? self::LABELS['uz'];
        $fill = fn (string $s) => strtr($s, ['{topic}' => $topic, '{subject}' => $subjectName, '{grade}' => $grade]);

        return [
            'lesson_type' => 'Yangi bilim beruvchi dars',
            'objective_main' => ucfirst($topic).' '.$fill($l['objective']).'.',
            'objectives' => [
                'educational' => $fill($l['educational']),
                'developmental' => $fill($l['developmental']),
                'upbringing' => $fill($l['upbringing']),
            ],
            'equipment' => $l['equipment'],
            'phases' => $this->buildPhases($topic, $subjectName, $phaseTargets, $language),
            'homework' => $fill($l['homework']),
            'title_hook' => $fill($l['hook']),
            'title_meta' => ["{$grade}-sinf", "{$duration} daqiqa", $subjectName],
            'slides' => $this->buildSlides($topic, $slideRange, $language),
            'test_questions' => $this->buildQuestions($topic, $language),
        ];
    }

    private function buildPhases(string $topic, string $subjectName, array $phaseTargets, string $language): array
    {
        $phases = [];
        foreach ($phaseTargets as $name => $minutes) {
            $phases[] = [
                'name' => $name,
                'duration_min' => $minutes,
                'content_html' => $this->phaseContent($name, $topic, $subjectName, $language),
            ];
        }

        return $phases;
    }

    private function phaseContent(string $phase, string $topic, string $subjectName, string $language): string
    {
        return match ($phase) {
            'Tashkiliy qism' => "<p>O'qituvchi o'quvchilar bilan salomlashadi, davomatni tekshiradi va \"{$topic}\" mavzusiga oid qiziqarli savol bilan diqqatni jalb qiladi.</p>",
            "O'tilganni faollashtirish" => "<p>O'quvchilarga oldingi mavzu bo'yicha savollar beriladi va ular {$subjectName} faniga oid bilimlarini eslashadi.</p><ul><li>Oldingi mavzuning asosiy tushunchasi qanday edi?</li><li>Bu bilim \"{$topic}\" mavzusiga qanday bog'liq?</li></ul>",
            'Yangi mavzu bayoni' => "<p><b>{$topic}</b> mavzusining asosiy tushunchalari:</p><ol><li><b>Ta'rif</b> — mavzuning asosiy ta'rifi va mohiyati.</li><li><b>Xususiyatlari</b> — mavzuga xos asosiy belgilar.</li><li><b>Misol</b> — hayotiy yoki fan bo'yicha konkret misol.</li><li><b>Qo'llanilishi</b> — bu bilim qayerda amaliy qo'llaniladi.</li></ol>",
            'Mustahkamlash' => "<p>Amaliy mashqlar:</p><ol><li>\"{$topic}\" mavzusiga oid 3 ta misol keltiring.</li><li>Daftaringizga mavzuning asosiy tushunchalarini yozing.</li><li>Juftlikda ishlab, bir-biringizga mavzuni tushuntirib bering.</li></ol>",
            'Jismoniy tarbiya daqiqasi' => '<p>O\'quvchilar o\'rindan turib, qisqa harakatli mashqlar bajaradilar — diqqatni tetiklashtiruvchi 2 daqiqalik faollik.</p>',
            'Dars yakuni' => "<p>Yakuniy savollar:</p><ul><li>\"{$topic}\" mavzusidan nimalarni o'rgandik?</li><li>Eng muhim tushuncha nima edi?</li></ul><p>O'quvchilar faolligi baholanadi.</p>",
            default => "<p>{$topic} mavzusi bo'yicha faoliyat.</p>",
        };
    }

    private function buildSlides(string $topic, array $range, string $language): array
    {
        $count = $range['min'];
        $titles = [
            "{$topic} — kirish",
            'Asosiy tushunchalar',
            'Ta\'rif va xususiyatlar',
            'Misollar',
            'Qo\'llanilishi',
            'Amaliy topshiriq',
            'Diqqatga molik faktlar',
            'Umumlashtirish',
            'Savollar',
            'Xulosa',
        ];

        $slides = [];
        for ($i = 0; $i < $count; $i++) {
            $title = $titles[$i] ?? "{$topic} — {$i}-qism";
            $isProse = $i % 2 === 0;

            $slides[] = [
                'title' => $title,
                'body' => [
                    'type' => $isProse ? 'prose' : 'bullets',
                    'paragraphs' => $isProse
                        ? ["{$topic} mavzusining shu qismi o'quvchilarga asosiy g'oyani tushuntiradi.", "Bu qism keyingi mavzularni tushunish uchun muhim asos bo'ladi."]
                        : ["{$topic} — 1-nuqta", "{$topic} — 2-nuqta", "{$topic} — 3-nuqta"],
                ],
            ];
        }

        return $slides;
    }

    private function buildQuestions(string $topic, string $language): array
    {
        $difficulties = array_merge(array_fill(0, 12, 'oson'), array_fill(0, 10, 'orta'), array_fill(0, 7, 'qiyin'));
        $questions = [];

        foreach ($difficulties as $i => $difficulty) {
            $n = $i + 1;
            $questions[] = [
                'text' => "\"{$topic}\" mavzusiga oid {$n}-savol: quyidagilardan qaysi biri to'g'ri?",
                'options' => [
                    "{$topic} bilan bog'liq to'g'ri javob",
                    "{$topic} bilan bog'liq bo'lmagan variant",
                    'Noto\'g\'ri variant',
                    'Noto\'g\'ri variant',
                ],
                'correct_index' => 0,
                'explanation' => "To'g'ri javob \"{$topic}\" mavzusining asosiy ta'rifiga mos keladi.",
                'difficulty' => $difficulty,
            ];
        }

        return $questions;
    }
}
