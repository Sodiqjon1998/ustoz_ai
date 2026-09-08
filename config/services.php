<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'gemini' => [
        'key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemini-flash-latest'),
        // Asosiy modelning bepul kvotasi kunlik va juda tor (~20 so'rov).
        // U tugaganda zaxira model ishlatiladi — uning kvotasi alohida
        // hisoblanadi, sifati biroz pastroq, lekin dars generatsiyasi to'xtamaydi.
        'fallback_model' => env('GEMINI_FALLBACK_MODEL', 'gemini-flash-lite-latest'),
    ],

    'generator' => [
        'url' => env('GENERATOR_URL', 'http://127.0.0.1:4000'),
    ],

    // Claude (AWS Bedrock, "Bedrock API keys" — Bearer token, SigV4 shart emas).
    // Gemini butunlay ishlamay qolsa (masalan loyiha bloklansa) avtomatik
    // zaxira sifatida ishlatiladi (GeminiService::generateLessonContent()).
    'bedrock' => [
        'token' => env('BEDROCK_API_KEY'),
        'region' => env('BEDROCK_REGION', 'eu-north-1'),
        'model' => env('BEDROCK_MODEL', 'eu.anthropic.claude-opus-5'),
    ],

];
