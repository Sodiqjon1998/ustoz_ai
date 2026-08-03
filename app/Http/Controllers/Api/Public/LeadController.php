<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\Request;

/**
 * Landing sahifadagi buyurtma formasidan keladigan ochiq (anonim) so'rovlar.
 * Admin panelidagi LeadController'dan ATAYLAB ajratilgan — bu yerdan hech
 * qachon status/assigned_to/note kabi ichki maydonlarni tegib bo'lmaydi.
 * Sabab: har kim POST qilishi mumkin — ishonchsiz kirish nuqtasi.
 */
class LeadController extends Controller
{
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
        ]);

        Lead::create($data + [
            // 'website' — leads jadvalidagi source enum'dagi qiymat; landing
            // formadan kelgan buyurtmalar shu manba bilan qayd etiladi.
            'source' => 'website',
            'status' => 'new',
        ]);

        // Ichki id/holatni javobda qaytarmaymiz — ochiq endpoint bo'lgani uchun
        // faqat "qabul qilindi" xabarini beramiz.
        return response()->json([
            'data' => [
                'message' => "Murojaatingiz qabul qilindi. 1 soat ichida bog'lanamiz.",
            ],
        ], 201);
    }
}
