<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiUsageLog;
use App\Models\Lead;
use App\Models\Lesson;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;

class DashboardController extends Controller
{
    /** TeacherController::GEMINI_FREE_DAILY_LIMIT bilan bir xil — Google'ning bepul kvota chegarasi. */
    private const GEMINI_FREE_DAILY_LIMIT = TeacherController::GEMINI_FREE_DAILY_LIMIT;

    public function stats()
    {
        $teacherCount = User::where('role', 'teacher')->count();
        $activeCount = User::where('role', 'teacher')->where('status', 'active')->count();

        $monthRevenueUzs = (int) Payment::where('status', 'paid')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount_uzs');

        $monthAiCostUsd = (float) AiUsageLog::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('cost_usd');

        $monthLessons = Lesson::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $totalLessons = Lesson::count();
        $cacheHits = Lesson::where('was_cache_hit', true)->count();
        $cacheHitRate = $totalLessons > 0 ? (int) round($cacheHits / $totalLessons * 100) : 0;

        $newLeadsCount = Lead::where('status', 'new')->count();

        $expiringSoonCount = Subscription::where('status', 'active')
            ->whereBetween('ends_at', [now(), now()->addDays(3)])
            ->count();

        // Umumiy (admin Sozlamalar yoki .env) kalitdan bugun necha so'rov
        // ketgani — o'qituvchilarning shaxsiy kaliti bo'lmaganda barchasi
        // shu BITTA kvotani baham ko'radi, shuning uchun bu eng tez tugaydigan
        // resurs.
        $sharedUsedToday = (int) AiUsageLog::where('provider', 'gemini')
            ->where('key_source', 'shared')
            ->whereDate('created_at', now())
            ->count();

        return response()->json([
            'data' => [
                'teacher_count' => $teacherCount,
                'active_count' => $activeCount,
                'month_revenue_uzs' => $monthRevenueUzs,
                'month_ai_cost_usd' => round($monthAiCostUsd, 2),
                'cache_hit_rate' => $cacheHitRate,
                'month_lessons' => $monthLessons,
                'new_leads_count' => $newLeadsCount,
                'expiring_soon_count' => $expiringSoonCount,
                'shared_gemini_usage_today' => [
                    'count' => $sharedUsedToday,
                    'limit' => self::GEMINI_FREE_DAILY_LIMIT,
                    'percent' => min(100, (int) round($sharedUsedToday / self::GEMINI_FREE_DAILY_LIMIT * 100)),
                ],
            ],
        ]);
    }
}
