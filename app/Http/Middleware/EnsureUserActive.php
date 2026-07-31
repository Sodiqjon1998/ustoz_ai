<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserActive
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user->status === 'suspended') {
            return response()->json([
                'errors' => [[
                    'code' => 'ACCOUNT_SUSPENDED',
                    'message' => 'Akkauntingiz vaqtincha to\'xtatilgan.',
                ]],
            ], 403);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'errors' => [[
                    'code' => 'ACCOUNT_NOT_ACTIVE',
                    'message' => 'Akkauntingiz hali faollashtirilmagan.',
                ]],
            ], 403);
        }

        return $next($request);
    }
}
