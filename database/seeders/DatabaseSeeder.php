<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            SubjectSeeder::class,
            PlanSeeder::class,
        ]);

        // Super admin — admin panelga kirish uchun
        User::factory()->create([
            'full_name' => 'Super Admin',
            'phone' => '+998900000001',
            'email' => 'admin@ustoz.ai',
            'role' => 'super_admin',
            'status' => 'active',
            'teacher_code' => 'USTOZ-0001',
        ]);

        // Test o'qituvchi — faol Pro obuna bilan (auth oqimini sinash uchun)
        $teacher = User::factory()->create([
            'full_name' => 'Test O\'qituvchi',
            'phone' => '+998900000002',
            'email' => 'teacher@ustoz.ai',
            'role' => 'teacher',
            'status' => 'active',
            'teacher_code' => 'USTOZ-0002',
        ]);

        Subscription::create([
            'user_id' => $teacher->id,
            'plan_id' => Plan::where('slug', 'pro')->value('id'),
            'starts_at' => now(),
            'ends_at' => now()->addDays(30),
            'status' => 'active',
            'generations_used' => 0,
            'activated_by' => $teacher->id,
        ]);
    }
}
