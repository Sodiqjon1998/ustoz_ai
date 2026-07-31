<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSubscriptionActive
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $subscription = $request->user()->activeSubscription();

        if (! $subscription) {
            return response()->json([
                'errors' => [[
                    'code' => 'SUBSCRIPTION_EXPIRED',
                    'message' => 'Obunangiz muddati tugagan yoki mavjud emas.',
                    'action' => ['type' => 'renew', 'url' => '/subscription'],
                ]],
            ], 402);
        }

        $request->attributes->set('subscription', $subscription);

        return $next($request);
    }
}
