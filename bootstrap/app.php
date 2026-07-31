<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'active' => \App\Http\Middleware\EnsureUserActive::class,
            'subscription' => \App\Http\Middleware\EnsureSubscriptionActive::class,
            'quota' => \App\Http\Middleware\CheckGenerationQuota::class,
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);

        // Sof API backend — web-session login sahifasi yo'q, shuning uchun
        // autentifikatsiyalanmagan so'rov hech qachon `login` route'ga
        // redirect qilinmasin, doim 401 JSON qaytarilsin.
        $middleware->redirectGuestsTo(fn () => null);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
