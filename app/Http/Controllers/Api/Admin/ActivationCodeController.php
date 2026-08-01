<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivationCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ActivationCodeController extends Controller
{
    private const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // I/O/0/1 chetlab o'tildi — qo'lda o'qish/kiritishda adashtirmasin

    public function index(Request $request)
    {
        $data = $request->validate([
            'status' => ['nullable', 'string', 'in:unused,used,revoked'],
            'batch_id' => ['nullable', 'string'],
        ]);

        $codes = ActivationCode::query()
            ->with(['plan:id,name', 'usedBy:id,full_name,phone'])
            ->when($data['status'] ?? null, fn ($q, $status) => $q->where('status', $status))
            ->when($data['batch_id'] ?? null, fn ($q, $batch) => $q->where('batch_id', $batch))
            ->latest()
            ->paginate(50);

        return response()->json([
            'data' => $codes->items(),
            'meta' => [
                'current_page' => $codes->currentPage(),
                'last_page' => $codes->lastPage(),
                'total' => $codes->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
            'count' => ['required', 'integer', 'min:1', 'max:200'],
            'expires_at' => ['nullable', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $batchId = (string) Str::uuid();
        $admin = $request->user();

        $codes = DB::transaction(function () use ($data, $batchId, $admin) {
            $created = [];
            for ($i = 0; $i < $data['count']; $i++) {
                $created[] = ActivationCode::create([
                    'code' => $this->generateCode(),
                    'plan_id' => $data['plan_id'],
                    'status' => 'unused',
                    'expires_at' => $data['expires_at'] ?? null,
                    'created_by' => $admin->id,
                    'batch_id' => $batchId,
                    'note' => $data['note'] ?? null,
                ]);
            }

            return $created;
        });

        return response()->json([
            'data' => [
                'batch_id' => $batchId,
                'codes' => array_map(fn ($c) => $c->code, $codes),
            ],
        ], 201);
    }

    public function revoke(ActivationCode $code)
    {
        if ($code->status !== 'unused') {
            return response()->json([
                'errors' => [[
                    'code' => 'CODE_NOT_REVOCABLE',
                    'message' => 'Faqat ishlatilmagan kodni bekor qilish mumkin.',
                ]],
            ], 409);
        }

        $code->forceFill(['status' => 'revoked'])->save();

        return response()->json(['data' => $code]);
    }

    public function export(Request $request)
    {
        $data = $request->validate([
            'batch_id' => ['nullable', 'string'],
        ]);

        $codes = ActivationCode::query()
            ->with('plan:id,name')
            ->when($data['batch_id'] ?? null, fn ($q, $batch) => $q->where('batch_id', $batch))
            ->orderBy('id')
            ->get();

        return new StreamedResponse(function () use ($codes) {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['Kod', 'Tarif', 'Holat', 'Muddati', 'Izoh']);
            foreach ($codes as $code) {
                fputcsv($out, [
                    $code->code,
                    $code->plan->name,
                    $code->status,
                    $code->expires_at?->toDateString() ?? '',
                    $code->note ?? '',
                ]);
            }
            fclose($out);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="faollashtirish-kodlari.csv"',
        ]);
    }

    private function generateCode(): string
    {
        do {
            $code = '';
            for ($i = 0; $i < 8; $i++) {
                $code .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
            }
        } while (ActivationCode::where('code', $code)->exists());

        return $code;
    }
}
