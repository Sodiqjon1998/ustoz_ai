<?php

namespace App\Services\Cache;

class TopicNormalizer
{
    private const PREFIXES = [
        'mavzu:', 'тема:', 'урок:', 'topic:', 'дарс:', 'dars:',
    ];

    private const CYRILLIC_TO_LATIN = [
        'ё' => 'yo', 'ю' => 'yu', 'я' => 'ya', 'ц' => 'ts', 'ш' => 'sh', 'ч' => 'ch',
        'ъ' => '', 'ь' => '', 'ў' => 'o', 'қ' => 'q', 'ғ' => 'g', 'ҳ' => 'h',
        'а' => 'a', 'б' => 'b', 'в' => 'v', 'г' => 'g', 'д' => 'd', 'е' => 'e',
        'ж' => 'j', 'з' => 'z', 'и' => 'i', 'й' => 'y', 'к' => 'k', 'л' => 'l',
        'м' => 'm', 'н' => 'n', 'о' => 'o', 'п' => 'p', 'р' => 'r', 'с' => 's',
        'т' => 't', 'у' => 'u', 'ф' => 'f', 'х' => 'x', 'ы' => 'i', 'э' => 'e',
    ];

    public function normalize(string $topic, string $language): string
    {
        $t = trim(mb_strtolower($topic, 'UTF-8'));

        // 1. Prefikslarni olib tashlash
        foreach (self::PREFIXES as $p) {
            if (str_starts_with($t, $p)) {
                $t = trim(mb_substr($t, mb_strlen($p)));
            }
        }

        // 2. Sinf raqamini olib tashlash: "7-sinf uchun", "7 класс"
        $t = preg_replace('/\b\d{1,2}[\-\s]?(sinf|синф|класс|grade)\b/u', '', $t);

        // 3. Tinish belgilari va ortiqcha bo'shliqlar
        $t = preg_replace('/[^\p{L}\p{N}\s]/u', ' ', $t);
        $t = preg_replace('/\s+/u', ' ', $t);

        // 4. O'zbek tili: kirill ↔ lotin yagona shaklga
        if (in_array($language, ['uz', 'uz_cyrl'], true)) {
            $t = $this->toLatin($t);
        }

        return trim($t);
    }

    private function toLatin(string $text): string
    {
        return strtr($text, self::CYRILLIC_TO_LATIN);
    }

    public function cacheKey(
        int $subjectId,
        int $grade,
        string $topicNormalized,
        int $duration,
        string $language,
        int $variant = 1,
        array $games = [],
    ): string {
        $gamesSignature = implode(',', $this->sortedGames($games));

        return hash('sha256', implode('|', [
            $subjectId, $grade, $topicNormalized, $duration, $language, $variant, $gamesSignature,
        ]));
    }

    /** @return array<int, string> */
    private function sortedGames(array $games): array
    {
        $games = array_values(array_unique(array_map('strval', $games)));
        sort($games);

        return $games;
    }
}
