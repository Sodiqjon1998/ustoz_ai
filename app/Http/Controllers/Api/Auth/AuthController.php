<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivationCode;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'phone' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('phone', $data['phone'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json([
                'errors' => [[
                    'code' => 'INVALID_CREDENTIALS',
                    'message' => 'Telefon raqami yoki parol noto\'g\'ri.',
                ]],
            ], 422);
        }

        $user->forceFill(['last_login_at' => now()])->save();

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => $this->presentUser($user),
                'must_change_password' => $user->must_change_password,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['data' => ['message' => 'Chiqildi.']]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'data' => $this->presentUser($request->user()),
        ]);
    }

    /**
     * Faollashtirish kodi orqali obunani ochish.
     */
    public function activate(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string'],
        ]);

        $code = ActivationCode::where('code', $data['code'])->first();

        if (! $code || ! $code->isUsable()) {
            return response()->json([
                'errors' => [[
                    'code' => 'CODE_ALREADY_USED',
                    'message' => 'Kod ishlatilgan yoki muddati tugagan.',
                ]],
            ], 409);
        }

        $user = $request->user();
        $plan = $code->plan;

        $subscription = DB::transaction(function () use ($code, $user, $plan) {
            $subscription = Subscription::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'activation_code_id' => $code->id,
                'starts_at' => now(),
                'ends_at' => now()->addDays($plan->duration_days),
                'status' => 'active',
                'generations_used' => 0,
                'activated_by' => $user->id,
            ]);

            $code->forceFill([
                'status' => 'used',
                'used_by_user_id' => $user->id,
                'used_at' => now(),
            ])->save();

            $user->forceFill(['status' => 'active'])->save();

            return $subscription;
        });

        return response()->json([
            'data' => [
                'subscription' => [
                    'plan' => $plan->name,
                    'ends_at' => $subscription->ends_at->toDateString(),
                ],
            ],
        ]);
    }

    public function changePassword(Request $request)
    {
        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json([
                'errors' => [[
                    'code' => 'INVALID_CREDENTIALS',
                    'message' => 'Joriy parol noto\'g\'ri.',
                ]],
            ], 422);
        }

        $user->forceFill([
            'password' => $data['password'],
            'must_change_password' => false,
        ])->save();

        return response()->json(['data' => ['message' => 'Parol yangilandi.']]);
    }

    /**
     * Admin bergan vaqtinchalik paroldan keyingi majburiy almashtirish.
     */
    public function firstChangePassword(Request $request)
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = $request->user();

        $user->forceFill([
            'password' => $data['password'],
            'must_change_password' => false,
        ])->save();

        return response()->json(['data' => ['message' => 'Parol o\'rnatildi.']]);
    }

    private function presentUser(User $user): array
    {
        $subscription = $user->activeSubscription();

        return [
            'id' => $user->id,
            'full_name' => $user->full_name,
            'phone' => $user->phone,
            'teacher_code' => $user->teacher_code,
            'role' => $user->role,
            'status' => $user->status,
            'default_language' => $user->default_language,
            'must_change_password' => $user->must_change_password,
            'subscription' => $subscription ? [
                'plan' => $subscription->plan->name,
                'ends_at' => $subscription->ends_at->toDateString(),
                'generations_used' => $subscription->generations_used,
                'generation_limit' => $subscription->plan->generation_limit,
            ] : null,
        ];
    }
}
