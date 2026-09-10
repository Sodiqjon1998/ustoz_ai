<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckGenerationQuota
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Lokal ishlab chiqishda kvota tekshirilmaydi — sinov darslarini
        // yaratish oylik limitni yeb qo'ymasligi kerak.
        if (app()->environment('local')) {
            return $next($request);
        }

        $subscription = $request->attributes->get('subscription')
            ?? $request->user()->activeSubscription();

        if (! $subscription || ! $subscription->hasQuotaRemaining()) {
            return response()->json([
                'errors' => [[
                    'code' => 'QUOTA_EXCEEDED',
                    'message' => 'Oylik generatsiya limitingiz tugagan.',
                    'action' => ['type' => 'upgrade', 'url' => '/subscription'],
                ]],
            ], 429);
        }

        return $next($request);
    }
}
