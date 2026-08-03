<?php

namespace App\Services\Generator;

use Illuminate\Support\Facades\Http;

class GeneratorClient
{
    /**
     * @return array{relative_path: string, file_size: int}
     *
     * @throws \RuntimeException
     */
    public function renderPptx(array $presentation): array
    {
        $baseUrl = config('services.generator.url');

        $response = Http::timeout(60)->post("{$baseUrl}/render/pptx", $presentation);

        if (! $response->successful()) {
            $msg = $response->json('error') ?? $response->body();
            throw new \RuntimeException("Generator xizmati xatosi: {$msg}");
        }

        return [
            'relative_path' => $response->json('relative_path'),
            'file_size' => (int) $response->json('file_size'),
        ];
    }

    /**
     * @return array{relative_path: string, file_size: int}
     *
     * @throws \RuntimeException
     */
    public function renderDocx(array $outline): array
    {
        $baseUrl = config('services.generator.url');

        $response = Http::timeout(60)->post("{$baseUrl}/render/docx", $outline);

        if (! $response->successful()) {
            $msg = $response->json('error') ?? $response->body();
            throw new \RuntimeException("Generator xizmati xatosi: {$msg}");
        }

        return [
            'relative_path' => $response->json('relative_path'),
            'file_size' => (int) $response->json('file_size'),
        ];
    }

    public function renderPdfHandout(array $payload): array
    {
        return $this->renderPdf('handout', $payload);
    }

    public function renderPdfTestSimple(array $payload): array
    {
        return $this->renderPdf('test-simple', $payload);
    }

    /**
     * @return array{relative_path: string, file_size: int}
     *
     * @throws \RuntimeException
     */
    private function renderPdf(string $subtype, array $payload): array
    {
        $baseUrl = config('services.generator.url');

        $response = Http::timeout(60)->post("{$baseUrl}/render/pdf/{$subtype}", $payload);

        if (! $response->successful()) {
            $msg = $response->json('error') ?? $response->body();
            throw new \RuntimeException("Generator xizmati xatosi: {$msg}");
        }

        return [
            'relative_path' => $response->json('relative_path'),
            'file_size' => (int) $response->json('file_size'),
        ];
    }
}
