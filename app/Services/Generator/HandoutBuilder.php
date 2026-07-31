<?php

namespace App\Services\Generator;

class HandoutBuilder
{
    /**
     * lecture_html'ni (h2 bo'limlarga bo'lingan) PDF tarqatma uchun
     * tartiblangan struktura'ga aylantiradi — DocxOutlineBuilder bilan bir
     * xil shakl, faqat PDF generatoriga mo'ljallangan.
     *
     * @return array{title: string, subjectName: string, grade: int, duration: int, objective: string, sections: array}
     */
    public function build(
        string $topic,
        string $subjectName,
        int $grade,
        int $duration,
        string $objective,
        string $lectureHtml,
    ): array {
        return [
            'title' => $topic,
            'subjectName' => $subjectName,
            'grade' => $grade,
            'duration' => $duration,
            'objective' => $objective,
            'sections' => $this->splitSections($lectureHtml),
        ];
    }

    /**
     * @return array<int, array{heading: string, blocks: array}>
     */
    private function splitSections(string $html): array
    {
        $parts = preg_split('/<h2[^>]*>(.*?)<\/h2>/is', $html, -1, PREG_SPLIT_DELIM_CAPTURE);

        if (count($parts) < 2) {
            return [];
        }

        $sections = [];
        for ($i = 1; $i < count($parts); $i += 2) {
            $heading = trim(strip_tags($parts[$i]));
            $body = $parts[$i + 1] ?? '';
            $blocks = $this->extractBlocks($body);

            if ($heading !== '' && count($blocks) > 0) {
                $sections[] = ['heading' => $heading, 'blocks' => $blocks];
            }
        }

        return $sections;
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
