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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('full_name', 150);
            $table->string('phone', 20);
            $table->string('telegram', 60)->nullable();
            $table->string('school', 200)->nullable();
            $table->string('region', 100)->nullable();
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->enum('source', ['website', 'video', 'telegram', 'instagram', 'referral', 'phone']);
            $table->string('plan_interest', 50)->nullable();
            $table->enum('status', ['new', 'contacted', 'awaiting_payment', 'paid', 'rejected', 'lost'])
                ->default('new');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamp('contacted_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
