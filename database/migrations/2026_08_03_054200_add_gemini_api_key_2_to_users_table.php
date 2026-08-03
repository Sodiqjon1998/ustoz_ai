<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Zaxira (ikkinchi) shaxsiy Gemini kaliti — birinchi kalitning
            // kunlik bepul kvotasi tugasa (429), GeminiService avtomatik shu
            // kalitga o'tadi. Alohida Google akkaunti bo'lgani uchun alohida
            // kvotaga ega.
            $table->text('gemini_api_key_2')->nullable()->after('gemini_api_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('gemini_api_key_2');
        });
    }
};
