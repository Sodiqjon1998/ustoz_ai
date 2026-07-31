<?php

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
        });
});
