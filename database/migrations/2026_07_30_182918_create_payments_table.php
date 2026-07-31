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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained('subscriptions')->nullOnDelete();
            $table->foreignId('lead_id')->nullable()->constrained('leads')->nullOnDelete();
            $table->integer('amount_uzs');
            $table->enum('method', ['card_transfer', 'cash', 'bank']);
            $table->string('card_last4', 4)->nullable();
            $table->string('sender_name', 150)->nullable();
            $table->enum('status', ['pending', 'paid', 'refunded'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->foreignId('received_by')->constrained('users')->restrictOnDelete();
            $table->string('receipt_path', 300)->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
