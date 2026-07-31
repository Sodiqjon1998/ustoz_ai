<?php

namespace App\Services\Generator;

class TestSimpleBuilder
{
    /**
     * test_questions'ni o'quvchiga chop etiladigan test payload'iga
     * aylantiradi — to'g'ri javob va izoh (correct_index, explanation)
     * qasddan olib tashlanadi, chunki bu material o'quvchi uchun.
     *
     * @param  array  $testQuestions  MaterialSet::content['test_questions'] (20 ta)
     * @return array{title: string, subjectName: string, grade: int, duration: int, questions: array}
     */
    public function build(string $topic, string $subjectName, int $grade, int $duration, array $testQuestions): array
    {
        return [
            'title' => "Test: {$topic}",
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
