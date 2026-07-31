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
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('material_set_id')->nullable()->constrained('material_sets')->nullOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->restrictOnDelete();
            $table->smallInteger('grade');
            $table->string('topic_raw', 200);
            $table->smallInteger('duration');
            $table->string('language', 10);
            $table->string('title', 200)->nullable();
            $table->enum('status', ['queued', 'generating', 'ready', 'failed'])->default('queued');
            $table->boolean('was_cache_hit')->default(false);
            $table->date('planned_date')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('material_set_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
