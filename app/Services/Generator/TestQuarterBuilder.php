<?php

namespace App\Services\Generator;

class TestQuarterBuilder
{
    public function __construct(private TestTierSplitter $splitter)
    {
    }

    /**
     * "Chorak nazorat ishi" — GeminiService'dan kelgan TO'LIQ savol banki
     * (~28-30 ta) ishlatiladi: barcha "oson"+"orta" savollar 1 ballik
     * "Asosiy savollar" bo'limiga, barcha "qiyin" savollar 2 ballik
     * "Qo'shimcha savollar" bo'limiga tushadi.
     *
     * @param  array  $testQuestions  MaterialSet::content['test_questions'] (~28-30 ta, difficulty bilan)
     * @return array{title: string, subjectName: string, grade: int, topic: string, tier1: array, tier2: array}
     */
    public function build(string $topic, string $subjectName, int $grade, array $testQuestions): array
    {
        $split = $this->splitter->split($testQuestions);

        return [
            'title' => 'Chorak nazorat ishi',
            'subjectName' => $subjectName,
            'grade' => $grade,
            'topic' => $topic,
            'tier1' => $this->stripAnswers($split['tier1']),
            'tier2' => $this->stripAnswers($split['tier2']),
        ];
    }

    /**
     * @return array<int, array{text: string, options: array}>
     */
    private function stripAnswers(array $questions): array
    {
        return array_values(array_map(
            fn (array $q) => ['text' => $q['text'], 'options' => $q['options']],
            $questions,
        ));
    }
}
