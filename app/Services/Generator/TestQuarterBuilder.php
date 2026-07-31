<?php

namespace App\Services\Generator;

class TestQuarterBuilder
{
    // HALOLLIK ESLATMASI: "Chorak nazorat ishi" odatda mustaqil ~30 ta
    // savoldan iborat bo'lishi kerak, lekin GeminiService (app/Services/Ai/
    // GeminiService.php) hozircha har bir mavzu uchun faqat 20 ta test savoli
    // generatsiya qiladi — xuddi shu savol banki pdf_test_simple bilan ham
    // bo'lishiladi. Bu yerda soxta qo'shimcha savollar to'qib chiqarilmaydi;
    // mavjud 20 ta savol "chorak nazorat ishi" formatida chop etiladi.
    // Kelajakda GeminiService'ga alohida, kattaroq chorak savol banki
    // generatsiya qilish funksiyasi qo'shilishi kerak — bu ishning
    // doirasidan tashqarida.

    /**
     * @param  array  $testQuestions  MaterialSet::content['test_questions'] (haqiqatda 20 ta)
     * @return array{title: string, subjectName: string, grade: int, duration: int, questions: array}
     */
    public function build(string $topic, string $subjectName, int $grade, int $duration, array $testQuestions): array
    {
        return [
            'title' => "Chorak nazorat ishi: {$topic}",
            'subjectName' => $subjectName,
            'grade' => $grade,
            'duration' => $duration,
            'questions' => $this->stripAnswers($testQuestions),
        ];
    }

    /**
     * @return array<int, array{text: string, options: array}>
     */
    private function stripAnswers(array $testQuestions): array
    {
        return array_values(array_map(
            fn (array $q) => ['text' => $q['text'], 'options' => $q['options']],
            $testQuestions,
        ));
    }
}
