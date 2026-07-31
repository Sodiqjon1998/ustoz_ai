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
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_set_id')->constrained('material_sets')->cascadeOnDelete();
            $table->enum('type', [
                'pptx', 'docx', 'pdf_handout', 'pdf_test_simple', 'pdf_test_quarter', 'pdf_extras',
            ]);
            $table->string('disk', 30)->default('public');
            $table->string('path', 300);
            $table->integer('file_size')->nullable();
            $table->char('checksum', 64)->nullable();
            $table->string('template_key', 60)->nullable();
            $table->integer('render_ms')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['material_set_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
