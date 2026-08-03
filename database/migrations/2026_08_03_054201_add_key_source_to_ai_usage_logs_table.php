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
        Schema::table('ai_usage_logs', function (Blueprint $table) {
            // Qaysi kalitdan foydalanilgani: "personal_1"/"personal_2"
            // (o'qituvchining shaxsiy kalitlari) yoki "shared" (admin
            // Sozlamalar/.env — umumiy kvota). Admin panelda umumiy kvota
            // sarfini kuzatish uchun.
            $table->string('key_source', 20)->nullable()->after('provider');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ai_usage_logs', function (Blueprint $table) {
            $table->dropColumn('key_source');
        });
    }
};
