<?php

namespace App\Services\Generator;

class TestSimpleBuilder
{
    public function __construct(private TestTierSplitter $splitter)
    {
    }

    /**
     * "Oddiy test" — to'liq savol bankidan qisqa, tez o'tkaziladigan
     * qism-to'plam: ~16 ta oson/o'rta (1 ball) + ~4 ta qiyin (2 ball).
     *
     * @param  array  $testQuestions  MaterialSet::content['test_questions'] (~28-30 ta, difficulty bilan)
     * @return array{title: string, subjectName: string, grade: int, topic: string, tier1: array, tier2: array}
     */
    public function build(string $topic, string $subjectName, int $grade, array $testQuestions): array
    {
        $split = $this->splitter->split($testQuestions, 16, 4);

        return [
            'title' => "{$subjectName} fanidan test",
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
