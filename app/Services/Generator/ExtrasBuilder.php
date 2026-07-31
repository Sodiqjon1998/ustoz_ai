<?php

namespace App\Services\Generator;

class ExtrasBuilder
{
    /**
     * lecture_html'ning oxirgi <h2> bo'limini (odatda xulosa/qo'shimcha
     * qism) "qo'shimcha material" sifatida ajratib oladi. Agar hech qanday
     * bo'lim topilmasa, PDF generator halol placeholder ko'rsatadi (bu
     * builder shunchaki heading/blocks'ni null/bo'sh qoldiradi).
     *
     * @return array{title: string, subjectName: string, objective: string, heading: ?string, blocks: array}
     */
    public function build(string $topic, string $subjectName, string $objective, string $lectureHtml): array
    {
        $lastSection = $this->lastSection($lectureHtml);

        return [
            'title' => "Qo'shimcha material: {$topic}",
            'subjectName' => $subjectName,
            'objective' => $objective,
            'heading' => $lastSection['heading'] ?? null,
            'blocks' => $lastSection['blocks'] ?? [],
        ];
    }

    /**
     * @return array{heading: string, blocks: array}|null
     */
    private function lastSection(string $html): ?array
    {
        $parts = preg_split('/<h2[^>]*>(.*?)<\/h2>/is', $html, -1, PREG_SPLIT_DELIM_CAPTURE);

        if (count($parts) < 2) {
            return null;
        }

        // Oxirgi <h2> juftligi — sarlavha $parts[count-2], matni $parts[count-1].
        $heading = trim(strip_tags($parts[count($parts) - 2]));
        $blocks = $this->extractBlocks($parts[count($parts) - 1] ?? '');

        if ($heading === '' || count($blocks) === 0) {
            return null;
        }

        return ['heading' => $heading, 'blocks' => $blocks];
    }

    /**
     * @return array<int, array{type: string, text: string}>
     */
    private function extractBlocks(string $html): array
    {
        $blocks = [];

        preg_match_all('/<(p|li)[^>]*>(.*?)<\/\1>/is', $html, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $text = trim(strip_tags($match[2]));
            if ($text === '') {
                continue;
            }

            $blocks[] = [
                'type' => $match[1] === 'li' ? 'bullet' : 'paragraph',
                'text' => $text,
            ];
        }

        return $blocks;
    }
}
