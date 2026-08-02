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
            // O'qituvchining shaxsiy Gemini kaliti — o'rnatilgan bo'lsa, uning
            // darslari shu kalit bilan (o'z bepul kvotasi hisobidan) generatsiya
            // qilinadi, admin/umumiy kalitga yuk tushmaydi. Shifrlangan saqlanadi.
            $table->text('gemini_api_key')->nullable()->after('must_change_password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('gemini_api_key');
        });
    }
};
