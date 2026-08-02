<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\User;
use App\Services\Admin\TeacherAccountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'string', 'in:pending,active,suspended'],
            'region' => ['nullable', 'string', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $teachers = User::query()
            ->where('role', 'teacher')
            ->when($data['q'] ?? null, fn ($q, $term) => $q->where(function ($q) use ($term) {
                $q->where('full_name', 'ilike', "%{$term}%")
                    ->orWhere('phone', 'ilike', "%{$term}%")
                    ->orWhere('teacher_code', 'ilike', "%{$term}%");
            }))
            ->when($data['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($data['region'] ?? null, fn ($q, $region) => $q->where('region', $region))
            ->with(['subscriptions' => fn ($q) => $q->where('status', 'active')->where('ends_at', '>', now())->latest('ends_at')->limit(1)->with('plan:id,name')])
            ->latest()
            ->paginate(20, [
                'id', 'full_name', 'phone', 'teacher_code', 'status', 'school', 'region', 'created_at',
            ]);

        return response()->json([
            'data' => $teachers->items(),
            'meta' => [
                'current_page' => $teachers->currentPage(),
                'last_page' => $teachers->lastPage(),
                'total' => $teachers->total(),
            ],
        ]);
    }

    public function show(User $teacher)
    {
        return response()->json(['data' => $this->present($teacher)]);
    }

    public function store(Request $request, TeacherAccountService $accounts)
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:20', 'unique:users,phone'],
            'school' => ['nullable', 'string', 'max:200'],
            'region' => ['nullable', 'string', 'max:100'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'language' => ['nullable', 'string', 'in:uz,ru,en'],
            // Majburiy — aks holda akkaunt obunasiz "Kutilmoqda" holatida osilib
            // qolib, o'qituvchi buni qanday faollashtirishni bilmay qoladi
            // (2026-08-01 da haqiqiy foydalanuvchi shu holatga tushib qoldi).
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
        ]);

        $admin = $request->user();
        $plan = Plan::findOrFail($data['plan_id']);

        [$user, $tempPassword] = DB::transaction(function () use ($accounts, $data, $admin, $plan) {
            [$user, $tempPassword] = $accounts->createAccount($data, $admin);

            $user->subscriptions()->create([
                'plan_id' => $plan->id,
                'starts_at' => now(),
                'ends_at' => now()->addDays($plan->duration_days),
                'status' => 'active',
                'generations_used' => 0,
                'activated_by' => $admin->id,
            ]);
            $user->forceFill(['status' => 'active'])->save();

            return [$user, $tempPassword];
        });

        return response()->json([
            'data' => [
                'user' => $this->present($user),
                'temp_password' => $tempPassword,
            ],
        ], 201);
    }

    public function update(Request $request, User $teacher)
    {
        $data = $request->validate([
            'full_name' => ['sometimes', 'string', 'max:150'],
            'school' => ['sometimes', 'nullable', 'string', 'max:200'],
            'region' => ['sometimes', 'nullable', 'string', 'max:100'],
            'default_subject_id' => ['sometimes', 'nullable', 'integer', 'exists:subjects,id'],
            'default_language' => ['sometimes', 'string', 'in:uz,ru,en'],
        ]);

        $teacher->forceFill($data)->save();

        return response()->json(['data' => $this->present($teacher)]);
    }

    public function activate(User $teacher)
    {
        $teacher->forceFill(['status' => 'active'])->save();

        return response()->json(['data' => $this->present($teacher)]);
    }

    public function suspend(User $teacher)
    {
        $teacher->forceFill(['status' => 'suspended'])->save();

        return response()->json(['data' => $this->present($teacher)]);
    }

    public function extend(Request $request, User $teacher)
    {
        $reference = $teacher->subscriptions()->latest('ends_at')->first();

        $data = $request->validate([
            'days' => ['required', 'integer', 'min:1', 'max:730'],
            // Faqat birinchi obuna ochilayotganda kerak — mavjud obunani
            // uzaytirishda o'sha obunaning rejasi saqlanib qolinadi.
            'plan_id' => [$reference ? 'nullable' : 'required', 'integer', 'exists:plans,id'],
        ]);

        DB::transaction(function () use ($request, $teacher, $reference, $data) {
            if ($reference && $reference->status === 'active' && $reference->ends_at->isFuture()) {
                $reference->forceFill(['ends_at' => $reference->ends_at->addDays($data['days'])])->save();

                return;
            }

            $teacher->subscriptions()->create([
                'plan_id' => $reference->plan_id ?? $data['plan_id'],
                'starts_at' => now(),
                'ends_at' => now()->addDays($data['days']),
                'status' => 'active',
                'generations_used' => 0,
                'activated_by' => $request->user()->id,
            ]);

            $teacher->forceFill(['status' => 'active'])->save();
        });

        return response()->json(['data' => $this->present($teacher->fresh())]);
    }

    public function resetPassword(Request $request, User $teacher, TeacherAccountService $accounts)
    {
        $tempPassword = $accounts->generateTempPassword();

        $teacher->forceFill([
            'password' => $tempPassword,
            'must_change_password' => true,
        ])->save();

        return response()->json([
            'data' => [
                'temp_password' => $tempPassword,
            ],
        ]);
    }

    public function destroy(User $teacher)
    {
        if ($teacher->role !== 'teacher') {
            abort(404);
        }

        $teacher->delete();

        return response()->json(['data' => ['message' => 'O\'chirildi.']]);
    }

    /**
     * O'qituvchining shaxsiy Gemini kalitini o'rnatish/o'chirish — shundan
     * keyin uning darslari umumiy kvotaga emas, shu kalitga sarflanadi.
     */
    public function setGeminiKey(Request $request, User $teacher)
    {
        $data = $request->validate([
            'gemini_api_key' => ['nullable', 'string', 'min:10', 'max:200'],
        ]);

        $teacher->forceFill(['gemini_api_key' => $data['gemini_api_key'] ?: null])->save();

        return response()->json(['data' => $this->present($teacher)]);
    }

    private function present(User $teacher): array
    {
        $subscription = $teacher->activeSubscription();
        $latestSubscription = $subscription ?? $teacher->subscriptions()->latest('ends_at')->first();

        return [
            'id' => $teacher->id,
            'full_name' => $teacher->full_name,
            'phone' => $teacher->phone,
            'teacher_code' => $teacher->teacher_code,
            'status' => $teacher->status,
            'school' => $teacher->school,
            'region' => $teacher->region,
            'last_login_at' => $teacher->last_login_at?->toIso8601String(),
            'created_at' => $teacher->created_at->toIso8601String(),
            'lessons_count' => $teacher->lessons()->count(),
            'total_paid_uzs' => (int) $teacher->payments()->where('status', 'paid')->sum('amount_uzs'),
            'gemini_api_key_set' => (bool) $teacher->gemini_api_key,
            'gemini_api_key_masked' => $teacher->gemini_api_key ? $this->mask($teacher->gemini_api_key) : null,
            'subscription' => $latestSubscription ? [
                'plan' => $latestSubscription->plan->name,
                'status' => $latestSubscription->status,
                'starts_at' => $latestSubscription->starts_at->toDateString(),
                'ends_at' => $latestSubscription->ends_at->toDateString(),
                'days_left' => now()->isBefore($latestSubscription->ends_at)
                    ? (int) now()->diffInDays($latestSubscription->ends_at)
                    : 0,
                'generations_used' => $latestSubscription->generations_used,
                'generation_limit' => $latestSubscription->plan->generation_limit,
            ] : null,
        ];
    }

    private function mask(string $key): string
    {
        $len = strlen($key);

        if ($len <= 8) {
            return str_repeat('•', $len);
        }

        return substr($key, 0, 4).str_repeat('•', $len - 8).substr($key, -4);
    }
}
