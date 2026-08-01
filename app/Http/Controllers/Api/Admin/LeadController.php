<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\Payment;
use App\Models\Plan;
use App\Models\User;
use App\Services\Admin\TeacherAccountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LeadController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'status' => ['nullable', 'string', 'in:new,contacted,awaiting_payment,paid,rejected,lost'],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $leads = Lead::query()
            ->with('subject:id,name_uz')
            ->when($data['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($data['q'] ?? null, fn ($q, $term) => $q->where(function ($q) use ($term) {
                $q->where('full_name', 'ilike', "%{$term}%")
                    ->orWhere('phone', 'ilike', "%{$term}%");
            }))
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $leads->items(),
            'meta' => [
                'current_page' => $leads->currentPage(),
                'last_page' => $leads->lastPage(),
                'total' => $leads->total(),
            ],
        ]);
    }

    public function show(Lead $lead)
    {
        return response()->json(['data' => $lead->load('subject:id,name_uz', 'user:id,teacher_code,phone')]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'full_name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'max:20'],
            'telegram' => ['nullable', 'string', 'max:60'],
            'school' => ['nullable', 'string', 'max:200'],
            'region' => ['nullable', 'string', 'max:100'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'plan_interest' => ['nullable', 'string', 'max:50'],
            'note' => ['nullable', 'string'],
        ]);

        $lead = Lead::create($data + ['source' => 'phone', 'status' => 'new']);

        return response()->json(['data' => $lead], 201);
    }

    public function update(Request $request, Lead $lead)
    {
        $data = $request->validate([
            'status' => ['sometimes', 'string', 'in:new,contacted,awaiting_payment,paid,rejected,lost'],
            'note' => ['sometimes', 'nullable', 'string'],
            'assigned_to' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
        ]);

        if (($data['status'] ?? null) === 'contacted' && ! $lead->contacted_at) {
            $data['contacted_at'] = now();
        }

        $lead->forceFill($data)->save();

        return response()->json(['data' => $lead]);
    }

    /**
     * docs/02-BAZA-VA-API.md §3.8 — bitta tugmali sotuv. Bitta tranzaksiyada:
     * akkaunt ochish + obuna + to'lov qaydi + lead'ni bog'lash.
     */
    public function convert(Request $request, Lead $lead, TeacherAccountService $accounts)
    {
        if ($lead->user_id) {
            return response()->json([
                'errors' => [[
                    'code' => 'LEAD_ALREADY_CONVERTED',
                    'message' => 'Bu murojaat bo\'yicha akkaunt allaqachon ochilgan.',
                ]],
            ], 409);
        }

        if (User::where('phone', $lead->phone)->exists()) {
            return response()->json([
                'errors' => [[
                    'code' => 'PHONE_ALREADY_EXISTS',
                    'message' => 'Bu telefon bilan akkaunt bor — uzaytirishdan foydalaning.',
                ]],
            ], 409);
        }

        $data = $request->validate([
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
            'amount_uzs' => ['required', 'integer', 'min:0'],
            'method' => ['required', 'string', 'in:card_transfer,cash,bank'],
            'card_last4' => ['nullable', 'string', 'max:4'],
            'sender_name' => ['nullable', 'string', 'max:150'],
            'paid_at' => ['nullable', 'date'],
            'send_credentials' => ['nullable', 'boolean'],
        ]);

        $plan = Plan::findOrFail($data['plan_id']);
        $admin = $request->user();

        [$user, $subscription, $payment, $tempPassword] = DB::transaction(function () use ($accounts, $lead, $plan, $data, $admin) {
            [$user, $tempPassword] = $accounts->createAccount([
                'full_name' => $lead->full_name,
                'phone' => $lead->phone,
                'school' => $lead->school,
                'region' => $lead->region,
                'subject_id' => $lead->subject_id,
            ], $admin);
            $user->forceFill(['status' => 'active'])->save();

            $subscription = $user->subscriptions()->create([
                'plan_id' => $plan->id,
                'starts_at' => now(),
                'ends_at' => now()->addDays($plan->duration_days),
                'status' => 'active',
                'generations_used' => 0,
                'activated_by' => $admin->id,
            ]);

            $payment = Payment::create([
                'user_id' => $user->id,
                'subscription_id' => $subscription->id,
                'lead_id' => $lead->id,
                'amount_uzs' => $data['amount_uzs'],
                'method' => $data['method'],
                'card_last4' => $data['card_last4'] ?? null,
                'sender_name' => $data['sender_name'] ?? null,
                'status' => 'paid',
                'paid_at' => $data['paid_at'] ?? now(),
                'received_by' => $admin->id,
            ]);

            $lead->forceFill(['status' => 'paid', 'user_id' => $user->id])->save();

            return [$user, $subscription, $payment, $tempPassword];
        });

        // Parol bazada hash saqlanadi — bu javobda faqat bir marta ko'rinadi.
        return response()->json([
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'teacher_code' => $user->teacher_code,
                    'phone' => $user->phone,
                    'temp_password' => $tempPassword,
                ],
                'subscription' => [
                    'plan' => $plan->name,
                    'ends_at' => $subscription->ends_at->toDateString(),
                ],
                'payment_id' => $payment->id,
                'credentials_sent' => false,
            ],
        ]);
    }
}
