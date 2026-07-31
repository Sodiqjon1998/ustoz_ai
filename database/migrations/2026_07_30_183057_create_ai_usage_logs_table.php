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
        Schema::create('ai_usage_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('lesson_id')->nullable()->constrained('lessons')->nullOnDelete();
            $table->foreignId('material_set_id')->nullable()->constrained('material_sets')->nullOnDelete();
            $table->string('provider', 30);
            $table->string('model', 60);
            $table->string('step', 40);
            $table->integer('input_tokens')->default(0);
            $table->integer('output_tokens')->default(0);
            $table->integer('cached_tokens')->default(0);
            $table->decimal('cost_usd', 10, 6)->default(0);
            $table->integer('latency_ms')->nullable();
            $table->boolean('cache_hit')->default(false);
            $table->timestamp('created_at')->useCurrent();

            $table->index('created_at');
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_usage_logs');
    }
};
