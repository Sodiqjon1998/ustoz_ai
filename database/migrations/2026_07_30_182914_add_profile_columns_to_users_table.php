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
            $table->string('phone', 20)->unique()->after('id');
            $table->enum('role', ['super_admin', 'admin', 'teacher'])->default('teacher')->after('password');
            $table->string('teacher_code', 12)->unique()->nullable()->after('role');
            $table->enum('status', ['pending', 'active', 'suspended'])->default('pending')->after('teacher_code');
            $table->string('school', 200)->nullable()->after('status');
            $table->string('region', 100)->nullable()->after('school');
            $table->foreignId('default_subject_id')->nullable()->after('region')
                ->constrained('subjects')->nullOnDelete();
            $table->string('default_language', 10)->default('uz')->after('default_subject_id');
            $table->boolean('must_change_password')->default(false)->after('default_language');
            $table->foreignId('created_by')->nullable()->after('must_change_password')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('last_login_at')->nullable()->after('created_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('default_subject_id');
            $table->dropConstrainedForeignId('created_by');
            $table->dropColumn([
                'phone', 'role', 'teacher_code', 'status', 'school', 'region',
                'default_language', 'must_change_password', 'last_login_at',
            ]);
        });
    }
};
