<?php

namespace App\Services\Generator;

class PresentationBuilder
{
    /**
     * lecture_html'ni (h2 bo'limlarga bo'lingan) slaydlar massiviga aylantiradi.
     *
     * @return array{theme: string, slides: array}
     */
    public function build(string $topic, string $subjectName, string $themeKey, string $lectureHtml): array
    {
        $slides = [
            [
                'layout' => 'title',
                'title' => $topic,
                'subtitle' => $subjectName,
            ],
        ];

        foreach ($this->splitSections($lectureHtml) as $section) {
            $slides[] = [
                'layout' => 'bullets',
                'title' => $section['title'],
                'bullets' => $section['bullets'],
            ];
        }

        return [
            'theme' => $themeKey,
            'slides' => $slides,
        ];
    }

    /**
     * @return array<int, array{title: string, bullets: string[]}>
     */
    private function splitSections(string $html): array
    {
        $parts = preg_split('/<h2[^>]*>(.*?)<\/h2>/is', $html, -1, PREG_SPLIT_DELIM_CAPTURE);

        if (count($parts) < 2) {
            return [];
        }

        $sections = [];
        // $parts[0] — birinchi <h2>dan oldingi kirish matni, uni tashlab yuboramiz.
        for ($i = 1; $i < count($parts); $i += 2) {
            $title = trim(strip_tags($parts[$i]));
            $body = $parts[$i + 1] ?? '';

            $bullets = $this->extractBullets($body);

            if ($title !== '' && count($bullets) > 0) {
                $sections[] = ['title' => $title, 'bullets' => $bullets];
            }
        }

        return $sections;
    }

    /**
     * @return string[]
     */
    private function extractBullets(string $html): array
    {
        $bullets = [];

        if (preg_match_all('/<li[^>]*>(.*?)<\/li>/is', $html, $matches)) {
            foreach ($matches[1] as $item) {
                $bullets[] = $this->clean($item);
            }
        }

        if (empty($bullets) && preg_match_all('/<p[^>]*>(.*?)<\/p>/is', $html, $matches)) {
            foreach ($matches[1] as $item) {
                $text = $this->clean($item);
                if ($text !== '') {
                    $bullets[] = $text;
                }
            }
        }

        return array_slice(array_filter($bullets, fn ($b) => $b !== ''), 0, 8);
    }

    private function clean(string $html): string
    {
        $text = trim(strip_tags($html));

        return mb_strlen($text) > 180 ? mb_substr($text, 0, 177).'...' : $text;
    }
}
