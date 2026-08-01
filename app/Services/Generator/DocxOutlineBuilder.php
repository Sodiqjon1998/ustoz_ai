<?php

namespace App\Services\Generator;

class DocxOutlineBuilder
{
    /**
     * GeminiService::generateLessonContent() natijasini DOCX generatoriga
     * mo'ljallangan "konspekt" strukturasiga aylantiradi — sarlavha bloki,
     * metama'lumot jadvali va "DARS BORISHI" bosqichlar jadvali.
     *
     * @return array{
     *     title: string, subjectName: string, grade: int, duration: int,
     *     lessonType: string, objectiveMain: string,
     *     objectives: array{educational: string, developmental: string, upbringing: string},
     *     equipment: string[],
     *     phases: array<int, array{name: string, durationMin: int, blocks: array}>,
     *     homework: string,
     * }
     */
    public function build(string $topic, string $subjectName, int $grade, int $duration, array $content): array
    {
        $objectives = (array) ($content['objectives'] ?? []);

        return [
            'title' => $topic,
            'subjectName' => $subjectName,
            'grade' => $grade,
            'duration' => $duration,
            'lessonType' => (string) ($content['lesson_type'] ?? ''),
            'objectiveMain' => (string) ($content['objective_main'] ?? ''),
            'objectives' => [
                'educational' => (string) ($objectives['educational'] ?? ''),
                'developmental' => (string) ($objectives['developmental'] ?? ''),
                'upbringing' => (string) ($objectives['upbringing'] ?? ''),
            ],
            'equipment' => array_values(array_filter((array) ($content['equipment'] ?? []))),
            'phases' => array_map(
                fn (array $phase) => [
                    'name' => (string) ($phase['name'] ?? ''),
                    'durationMin' => (int) ($phase['duration_min'] ?? 0),
                    'blocks' => HtmlBlockParser::toBlocks((string) ($phase['content_html'] ?? '')),
                ],
                (array) ($content['phases'] ?? []),
            ),
            'homework' => (string) ($content['homework'] ?? ''),
        ];
    }
}
