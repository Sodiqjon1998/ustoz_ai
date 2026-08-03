<?php

use App\Http\Controllers\Api\Admin\ActivationCodeController as AdminActivationCodeController;
use App\Http\Controllers\Api\Admin\CacheController as AdminCacheController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\LeadController as AdminLeadController;
use App\Http\Controllers\Api\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\Admin\PlanController as AdminPlanController;
use App\Http\Controllers\Api\Admin\SettingsController as AdminSettingsController;
use App\Http\Controllers\Api\Admin\TeacherController as AdminTeacherController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\SubjectController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Ochiq — auth talab qilinmaydi (landing, buyurtma formasi)
    Route::prefix('public')->group(function () {
        // Narxlar ro'yxati — landing sahifada ko'rsatiladi. Faqat pullik va faol
        // tariflar (Sinov rejasi umumiy sotuvda ko'rinmasin).
        Route::get('/plans', function () {
            return response()->json([
                'data' => \App\Models\Plan::where('is_active', true)
                    ->where('price_uzs', '>', 0)
                    ->orderBy('price_uzs')
                    ->get(['id', 'name', 'price_uzs', 'duration_days', 'generation_limit']),
            ]);
        });

        // Fanlar ro'yxati — landing formada "qaysi fandan dars berasiz" tanlovi
        // uchun. `/subjects` endpointining o'zi auth talab qiladi, shuning uchun
        // shu yerda ochiq nusxa berilgan.
        Route::get('/subjects', function () {
            return response()->json([
                'data' => \App\Models\Subject::where('is_active', true)
                    ->orderBy('sort_order')
                    ->get(['id', 'name_uz']),
            ]);
        });

        // Buyurtma yuborish — landing formadan keladi. Spam/bot bo'lishi mumkin
        // bo'lgani uchun IP bo'yicha throttle: soatiga 5 ta so'rovdan ko'p emas.
        Route::post('/leads', [\App\Http\Controllers\Api\Public\LeadController::class, 'store'])
            ->middleware('throttle:5,60');
    });

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/activate', [AuthController::class, 'activate']);
            Route::post('/password/change', [AuthController::class, 'changePassword']);
            Route::post('/password/first-change', [AuthController::class, 'firstChangePassword']);
        });
    });

    // O'qituvchi — to'liq zanjir: auth -> faol akkaunt -> faol obuna
    Route::middleware(['auth:sanctum', 'active', 'subscription'])->group(function () {
        Route::get('/ping', fn (Request $request) => response()->json([
            'data' => ['message' => 'pong', 'user_id' => $request->user()->id],
        ]));

        Route::get('/subjects', [SubjectController::class, 'index']);
        Route::get('/subjects/{subject}/popular-topics', [SubjectController::class, 'popularTopics']);
        Route::get('/lessons', [LessonController::class, 'index']);
        Route::get('/lessons/{lesson}/download/{type}', [LessonController::class, 'download']);

        Route::post('/lessons', [LessonController::class, 'store'])->middleware('quota');
    });

    // Admin — auth -> faol akkaunt -> rol tekshiruvi
    Route::prefix('admin')
        ->middleware(['auth:sanctum', 'active', 'role:admin,super_admin'])
        ->group(function () {
            Route::get('/ping', fn (Request $request) => response()->json([
                'data' => ['message' => 'admin pong', 'role' => $request->user()->role],
            ]));

            Route::get('/stats', [AdminDashboardController::class, 'stats']);
            Route::get('/plans', [AdminPlanController::class, 'index']);

            Route::get('/leads', [AdminLeadController::class, 'index']);
            Route::post('/leads', [AdminLeadController::class, 'store']);
            Route::get('/leads/{lead}', [AdminLeadController::class, 'show']);
            Route::patch('/leads/{lead}', [AdminLeadController::class, 'update']);
            Route::post('/leads/{lead}/convert', [AdminLeadController::class, 'convert']);

            Route::get('/teachers', [AdminTeacherController::class, 'index']);
            Route::post('/teachers', [AdminTeacherController::class, 'store']);
            Route::get('/teachers/{teacher}', [AdminTeacherController::class, 'show']);
            Route::patch('/teachers/{teacher}', [AdminTeacherController::class, 'update']);
            Route::post('/teachers/{teacher}/activate', [AdminTeacherController::class, 'activate']);
            Route::post('/teachers/{teacher}/suspend', [AdminTeacherController::class, 'suspend']);
            Route::post('/teachers/{teacher}/extend', [AdminTeacherController::class, 'extend']);
            Route::post('/teachers/{teacher}/reset-password', [AdminTeacherController::class, 'resetPassword']);
            Route::post('/teachers/{teacher}/gemini-key', [AdminTeacherController::class, 'setGeminiKey']);
            Route::delete('/teachers/{teacher}', [AdminTeacherController::class, 'destroy']);

            Route::get('/codes', [AdminActivationCodeController::class, 'index']);
            Route::post('/codes', [AdminActivationCodeController::class, 'store']);
            Route::get('/codes/export', [AdminActivationCodeController::class, 'export']);
            Route::post('/codes/{code}/revoke', [AdminActivationCodeController::class, 'revoke']);

            Route::get('/payments', [AdminPaymentController::class, 'index']);
            Route::post('/payments', [AdminPaymentController::class, 'store']);

            Route::get('/cache', [AdminCacheController::class, 'index']);
            Route::get('/cache/{cache}', [AdminCacheController::class, 'show']);
            Route::delete('/cache/{cache}', [AdminCacheController::class, 'destroy']);

            Route::get('/settings', [AdminSettingsController::class, 'show']);
            Route::post('/settings', [AdminSettingsController::class, 'update']);
        });
});
