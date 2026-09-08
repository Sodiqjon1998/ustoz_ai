<?php

namespace App\Services\Ai;

use Illuminate\Support\Facades\Http;

/**
 * Claude (Amazon Bedrock, Converse API) — Gemini butunlay ishlamay qolganda
 * (masalan loyiha bloklansa) zaxira sifatida ishlatiladi. Auth — Bedrock
 * "API key" (Bearer token), an'anaviy AWS SigV4 imzolash shart emas.
 */
class ClaudeService
{
    private ?string $lastUsedModel = null;

    private ?array $lastUsage = null;

    public function call(string $prompt): mixed
    {
        $token = config('services.bedrock.token');
        $region = config('services.bedrock.region');
        $model = config('services.bedrock.model');

        if (! $token) {
            throw new \RuntimeException('Claude (Bedrock) API kaliti sozlanmagan.');
        }

        $response = Http::timeout(180)
            ->withToken($token)
            ->post("https://bedrock-runtime.{$region}.amazonaws.com/model/{$model}/converse", [
                'messages' => [
                    ['role' => 'user', 'content' => [['text' => $prompt]]],
                ],
                'inferenceConfig' => [
                    // Gemini bilan bir xil hajm — 9 boy slayd + 6 bosqich +
                    // 30 test savoli katta javob talab qiladi.
                    'maxTokens' => 32768,
                    'temperature' => 0.55,
                ],
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException(
                'Claude (Bedrock) xizmati xatosi: '.($response->json('message') ?? $response->body())
            );
        }

        $text = $response->json('output.message.content.0.text');

        if (! $text) {
            $stopReason = $response->json('stopReason');

            throw new \RuntimeException(
                "Claude bo'sh javob qaytardi (stopReason: {$stopReason}). Qayta urinib ko'ring."
            );
        }

        $this->lastUsedModel = $model;
        $this->lastUsage = $response->json('usage');

        // Prompt JSON'dan boshqa hech narsa yozmaslikni talab qiladi, lekin
        // Claude ba'zan javobni ```json ... ``` bilan o'rab yuborishi mumkin —
        // himoya sifatida tozalaymiz.
        $text = trim($text);
        $text = preg_replace('/^```json\s*|\s*```$/i', '', $text);

        return json_decode(trim($text), true);
    }

    public function lastUsedModel(): ?string
    {
        return $this->lastUsedModel;
    }

    public function lastUsage(): ?array
    {
        return $this->lastUsage;
    }
}
