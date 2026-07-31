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
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 50)->unique();
            $table->string('name_uz', 100);
            $table->string('name_ru', 100);
            $table->string('name_en', 100);
            $table->string('icon', 50);
            $table->string('color', 7);
            $table->string('theme_key', 50);
            $table->smallInteger('grade_min');
            $table->smallInteger('grade_max');
            $table->string('default_language', 10)->default('uz');
            $table->boolean('is_active')->default(true);
            $table->smallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
