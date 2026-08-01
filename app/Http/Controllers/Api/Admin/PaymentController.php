<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'status' => ['nullable', 'string', 'in:pending,paid,refunded'],
        ]);

        $payments = Payment::query()
            ->with(['user:id,full_name,phone,teacher_code', 'receivedBy:id,full_name'])
            ->when($data['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->latest('paid_at')
            ->paginate(30);

        return response()->json([
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'total' => $payments->total(),
                'total_paid_uzs' => (int) Payment::where('status', 'paid')->sum('amount_uzs'),
            ],
        ]);
    }

    /**
     * Mavjud o'qituvchi uchun to'lovni qo'lda qayd etish — rejaning to'liq
     * muddatiga obunani yangilaydi/uzaytiradi (tezkor "+N kun" tugmalaridan
     * farqli — bu haqiqiy to'lov, shuning uchun rejaga bog'liq).
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
            'amount_uzs' => ['required', 'integer', 'min:0'],
            'method' => ['required', 'string', 'in:card_transfer,cash,bank'],
            'card_last4' => ['nullable', 'string', 'max:4'],
            'sender_name' => ['nullable', 'string', 'max:150'],
            'paid_at' => ['nullable', 'date'],
            'note' => ['nullable', 'string'],
        ]);

        $teacher = User::where('role', 'teacher')->findOrFail($data['user_id']);
        $plan = Plan::findOrFail($data['plan_id']);
        $admin = $request->user();

        $payment = DB::transaction(function () use ($teacher, $plan, $data, $admin) {
            $reference = $teacher->subscriptions()->latest('ends_at')->first();

            if ($reference && $reference->status === 'active' && $reference->ends_at->isFuture()) {
                $subscription = $reference;
                $subscription->forceFill(['ends_at' => $subscription->ends_at->addDays($plan->duration_days)])->save();
            } else {
                $subscription = $teacher->subscriptions()->create([
                    'plan_id' => $plan->id,
                    'starts_at' => now(),
                    'ends_at' => now()->addDays($plan->duration_days),
                    'status' => 'active',
                    'generations_used' => 0,
                    'activated_by' => $admin->id,
                ]);
                $teacher->forceFill(['status' => 'active'])->save();
            }

            return Payment::create([
                'user_id' => $teacher->id,
                'subscription_id' => $subscription->id,
                'amount_uzs' => $data['amount_uzs'],
                'method' => $data['method'],
                'card_last4' => $data['card_last4'] ?? null,
                'sender_name' => $data['sender_name'] ?? null,
                'status' => 'paid',
                'paid_at' => $data['paid_at'] ?? now(),
                'received_by' => $admin->id,
                'note' => $data['note'] ?? null,
            ]);
        });

        return response()->json(['data' => $payment->load('user:id,full_name,phone,teacher_code')], 201);
    }
}
