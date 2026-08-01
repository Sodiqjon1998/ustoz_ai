<?php

namespace App\Services\Generator;

class PresentationBuilder
{
    /** Matnli (illyustratsiya kartali) maketlar. */
    private const TEXT_LAYOUTS = ['bullets', 'prose'];

    /** Vizual maketlar — har biri o'z qo'shimcha maydonini talab qiladi. */
    private const VISUAL_LAYOUTS = ['chart', 'process', 'compare'];

    /**
     * GeminiService::generateLessonContent() natijasidagi "slides" massivini
     * PPTX generatoriga map qiladi. Slayd maketi Gemini tanlagan "body.type"
     * bo'yicha aniqlanadi; vizual maketlar (chart/process/compare) uchun kerakli
     * ma'lumot yetishmasa, slayd matnli maketga tushiriladi — chala diagramma
     * chizishdan ko'ra oddiy ro'yxat ko'rsatgan ma'qul.
     *
     * @return array{theme: string, slides: array}
     */
    public function build(string $topic, string $subjectName, string $themeKey, int $grade, array $content): array
    {
        $titleMeta = array_slice(array_values(array_filter((array) ($content['title_meta'] ?? []))), 0, 3);

        $slides = [
            [
                'layout' => 'title',
                'title' => $topic,
                'subjectLine' => "{$subjectName} · {$grade}-sinf",
                'hook' => (string) ($content['title_hook'] ?? ''),
                'metaLine' => implode('   ·   ', $titleMeta),
            ],
        ];

        $footer = "{$topic} · {$subjectName}";

        foreach ((array) ($content['slides'] ?? []) as $slide) {
            $built = $this->buildContentSlide((array) $slide, $footer);

            if ($built !== null) {
                $slides[] = $built;
            }
        }

        return [
            'theme' => $themeKey,
            'slides' => $slides,
        ];
    }

    private function buildContentSlide(array $slide, string $footer): ?array
    {
        if (empty($slide['title'])) {
            return null;
        }

        $type = (string) ($slide['body']['type'] ?? 'bullets');
        $paragraphs = array_values(array_filter(array_map('strval', (array) ($slide['body']['paragraphs'] ?? []))));

        $base = [
            'title' => (string) $slide['title'],
            'footer' => $footer,
            'items' => $paragraphs,
        ];

        if (! empty($slide['notes'])) {
            $base['notes'] = (string) $slide['notes'];
        }

        if (in_array($type, self::VISUAL_LAYOUTS, true)) {
            $visual = $this->visualPayload($type, $slide);

            if ($visual !== null) {
                return ['layout' => $type] + $visual + $base;
            }
        }

        if (empty($paragraphs)) {
            return null;
        }

        return ['layout' => in_array($type, self::TEXT_LAYOUTS, true) ? $type : 'bullets'] + $base;
    }

    /**
     * Vizual maket uchun qo'shimcha maydonni tayyorlaydi. Ma'lumot ishonchsiz
     * yoki chala bo'lsa null qaytaradi va chaqiruvchi matnli maketga qaytadi.
     */
    private function visualPayload(string $type, array $slide): ?array
    {
        if ($type === 'chart') {
            $chart = (array) ($slide['chart'] ?? []);
            $points = [];

            foreach ((array) ($chart['data'] ?? []) as $point) {
                if (! is_array($point) || ! isset($point['label'], $point['value']) || ! is_numeric($point['value'])) {
                    continue;
                }

                $points[] = [
                    'label' => (string) $point['label'],
                    'value' => (float) $point['value'],
                ];
            }

            // Ikkitadan kam nuqtada diagramma hech narsani ko'rsatmaydi.
            // Manbasiz raqamlar esa umuman chizilmaydi — o'ylab topilgan
            // statistika materialni yaroqsiz qiladi (GeminiService'da ham
            // shu tekshiruv bor; qo'lda yozilgan materiallar uchun shu yerda).
            if (count($points) < 2 || trim((string) ($chart['source'] ?? '')) === '') {
                return null;
            }

            $caption = trim((string) ($chart['caption'] ?? ''));
            $source = trim((string) $chart['source']);

            return [
                'chart' => [
                    'kind' => ($chart['kind'] ?? 'bar') === 'pie' ? 'pie' : 'bar',
                    'title' => (string) ($chart['title'] ?? ''),
                    'caption' => $caption !== '' ? $caption : $source,
                    'series_name' => (string) ($chart['series_name'] ?? ''),
                    'data' => array_slice($points, 0, 6),
                ],
            ];
        }

        if ($type === 'process') {
            $steps = [];

            foreach ((array) ($slide['steps'] ?? []) as $step) {
                if (! is_array($step) || empty($step['title'])) {
                    continue;
                }

                $steps[] = [
                    'title' => (string) $step['title'],
                    'detail' => (string) ($step['detail'] ?? ''),
                ];
            }

            return count($steps) >= 3 ? ['steps' => array_slice($steps, 0, 5)] : null;
        }

        $compare = (array) ($slide['compare'] ?? []);
        $sides = [];

        foreach (['left', 'right'] as $side) {
            $data = (array) ($compare[$side] ?? []);
            $items = array_values(array_filter(array_map('strval', (array) ($data['items'] ?? []))));

            if (empty($data['heading']) || count($items) < 2) {
                return null;
            }

            $sides[$side] = [
                'heading' => (string) $data['heading'],
                'items' => array_slice($items, 0, 6),
            ];
        }

        return ['compare' => $sides];
    }
}
