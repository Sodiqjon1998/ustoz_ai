<?php

use App\Http\Controllers\Api\Admin\ActivationCodeController as AdminActivationCodeController;
use App\Http\Controllers\Api\Admin\CacheController as AdminCacheController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\LeadController as AdminLeadController;
use App\Http\Controllers\Api\Admin\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\Admin\PlanController as AdminPlanController;
use App\Http\Controllers\Api\Admin\TeacherController as AdminTeacherController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\SubjectController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Ochiq — auth talab qilinmaydi (landing, buyurtma formasi)
    Route::prefix('public')->group(function () {
        Route::post('/leads', function () {
            return response()->json(['data' => ['message' => 'TODO: LeadController']]);
        });
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

        // Haqiqiy AI generatsiya ulanganda bu yerga 'quota' middleware qo'shiladi
        // (hozircha faqat kesh tekshiruvi + navbatga qo'yish, quota sarflanmaydi).
        Route::post('/lessons', [LessonController::class, 'store']);
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
        });
});
