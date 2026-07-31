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
        Schema::create('material_sets', function (Blueprint $table) {
            $table->id();
            $table->char('cache_key', 64)->unique();
            $table->foreignId('subject_id')->constrained('subjects')->restrictOnDelete();
            $table->smallInteger('grade');
            $table->string('topic_raw', 200);
            $table->string('topic_normalized', 200);
            $table->string('topic_display', 200)->nullable();
            $table->smallInteger('duration');
            $table->string('language', 10);
            $table->smallInteger('variant')->default(1);
            $table->jsonb('content');
            // topic_embedding vector(1536) — pgvector kengaytmasi o'rnatilgach alohida
            // migratsiyada qo'shiladi (HNSW indeks bilan birga). Hozircha kesh faqat
            // aniq cache_key mosligiga tayanadi (1-2 bosqich); 3-bosqich (o'xshashlik
            // qidiruvi) shu ustun qo'shilgach yoqiladi.
            $table->enum('status', ['ready', 'failed', 'archived'])->default('ready');
            $table->integer('hit_count')->default(0);
            $table->integer('rating_sum')->default(0);
            $table->integer('rating_count')->default(0);
            $table->string('ai_provider', 30)->nullable();
            $table->string('ai_model', 60)->nullable();
            $table->integer('input_tokens')->nullable();
            $table->integer('output_tokens')->nullable();
            $table->decimal('cost_usd', 10, 5)->nullable();
            $table->integer('generation_ms')->nullable();
            $table->timestamps();

            $table->index(['subject_id', 'grade', 'duration', 'language']);
            $table->index('hit_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('material_sets');
    }
};
