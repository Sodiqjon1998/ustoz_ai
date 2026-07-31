<?php

namespace App\Services\Ai;

use App\Models\Subject;
use Illuminate\Support\Facades\Http;

class GeminiService
{
    private const LANGUAGE_NAMES = [
        'uz' => "o'zbek",
        'ru' => 'rus',
        'en' => 'ingliz',
    ];

    /**
     * @return array{objective: string, lecture_html: string, test_questions: array}
     *
     * @throws \RuntimeException
     */
    public function generateLessonContent(Subject $subject, int $grade, string $topic, int $duration, string $language): array
    {
        $languageName = self::LANGUAGE_NAMES[$language] ?? "o'zbek";
        $subjectName = $subject->name_uz;

        $prompt = <<<PROMPT
Sen tajribali, o'quvchilarni qiziqtira oladigan {$subjectName} o'qituvchisisan. {$grade}-sinf o'quvchilari uchun "{$topic}" mavzusida {$duration} daqiqalik bitta darsga to'liq material tayyorla. Butun javob {$languageName} tilida bo'lsin.

<user_topic>{$topic}</user_topic>

Quyidagilarni yarat:

1. "objective" — dars maqsadi, 1 gap.

2. "lecture_html" — darsning TO'LIQ matni, bitta uzluksiz HTML hujjat sifatida. Bu matn ham o'quvchi konspekti, ham (bo'limlarga bo'linib) taqdimot slaydlari sifatida ishlatiladi. QOIDALAR:
   - Matnni 8-12 ta bo'limga bo'l, har biri <h2>Bo'lim sarlavhasi</h2> bilan boshlansin (har <h2> — alohida slayd)
   - Har bir bo'lim QISQA: 2-4 ta qisqa paragraf yoki ro'yxat, slaydga sig'adigan hajmda
   - Formatlash uchun: <p>, <ul><li>, <ol><li>, <b>, <code>
   - Birinchi <h2>dan oldin qisqa qiziqarli kirish (1-2 gap)
   - Oxirgi bo'lim — xulosa

3. "test_questions" — shu mavzu bo'yicha 20 ta test savoli. Har birida aniq 4 ta variant, faqat bittasi to'g'ri. Qiyinlik aralash (oson/o'rta/qiyin).

Javobni FAQAT quyidagi JSON formatda qaytar, boshqa hech narsa yozma:

{"objective": "...", "lecture_html": "...", "test_questions": [{"text": "...", "options": ["...", "...", "...", "..."], "correct_index": 0, "explanation": "..."}]}
PROMPT;

        $data = $this->call($prompt);

        if (! is_array($data) || empty($data['lecture_html'])) {
            throw new \RuntimeException("Gemini javobini o'qib bo'lmadi. Qayta urinib ko'ring.");
        }

        $questions = [];
        foreach ((array) ($data['test_questions'] ?? []) as $q) {
            if (
                isset($q['text'], $q['options'], $q['correct_index'])
                && is_array($q['options'])
                && count($q['options']) === 4
                && is_int($q['correct_index'])
                && $q['correct_index'] >= 0
                && $q['correct_index'] <= 3
            ) {
                $questions[] = [
                    'text' => (string) $q['text'],
                    'options' => array_map('strval', array_values($q['options'])),
                    'correct_index' => $q['correct_index'],
                    'explanation' => (string) ($q['explanation'] ?? ''),
                ];
            }
        }

        return [
            'objective' => (string) ($data['objective'] ?? ''),
            'lecture_html' => (string) $data['lecture_html'],
            'test_questions' => $questions,
        ];
    }

    private function call(string $prompt): mixed
    {
        $key = config('services.gemini.key');

        if (! $key) {
            throw new \RuntimeException("Gemini API kaliti sozlanmagan. .env faylga GEMINI_API_KEY qo'shing.");
        }

        $model = config('services.gemini.model', 'gemini-flash-latest');

        $response = Http::timeout(120)->post(
            "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$key}",
            [
                'contents' => [
                    ['parts' => [['text' => $prompt]]],
                ],
                'generationConfig' => [
                    'response_mime_type' => 'application/json',
                    'temperature' => 0.8,
                ],
            ]
        );

        if (! $response->successful()) {
            $msg = $response->json('error.message') ?? $response->body();
            throw new \RuntimeException('Gemini API xatosi: '.$msg);
        }

        $text = $response->json('candidates.0.content.parts.0.text');

        if (! $text) {
            throw new \RuntimeException('Gemini bo\'sh javob qaytardi. Qayta urinib ko\'ring.');
        }

        return json_decode($text, true);
    }
}
