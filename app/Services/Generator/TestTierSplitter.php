<?php

namespace App\Services\Generator;

class TestTierSplitter
{
    /**
     * GeminiService::generateLessonContent()['test_questions']'ni (difficulty
     * bilan belgilangan) ikki bosqichli chop etish strukturasiga bo'ladi:
     * tier1 — "oson"+"orta" (1 ballik "Asosiy savollar"), tier2 — "qiyin"
     * (2 ballik "Qo'shimcha savollar"). $tier1Cap/$tier2Cap null bo'lsa,
     * shu toifadagi BARCHA savollar ishlatiladi.
     *
     * @param  array  $questions  {text, options, correct_index, explanation, difficulty}[]
     * @return array{tier1: array, tier2: array}
     */
    public function split(array $questions, ?int $tier1Cap = null, ?int $tier2Cap = null): array
    {
        $easy = [];
        $hard = [];

        foreach ($questions as $q) {
            if (($q['difficulty'] ?? 'orta') === 'qiyin') {
                $hard[] = $q;
            } else {
                $easy[] = $q;
            }
        }

        $tier1 = $tier1Cap !== null ? array_slice($easy, 0, $tier1Cap) : $easy;
        $tier2 = $tier2Cap !== null ? array_slice($hard, 0, $tier2Cap) : $hard;

        // "qiyin" savollar yetarli bo'lmasa, tier2'ni oson/orta qoldig'idan to'ldiramiz.
        if ($tier2Cap !== null && count($tier2) < $tier2Cap && count($easy) > count($tier1)) {
            $need = $tier2Cap - count($tier2);
            $tier2 = array_merge($tier2, array_slice($easy, count($tier1), $need));
        }

        return [
            'tier1' => array_values($tier1),
            'tier2' => array_values($tier2),
        ];
    }
}
