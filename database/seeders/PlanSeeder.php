<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Narxlar: docs/04-UI-UX.md § 5.2.1 va docs/03-AI-KESH-GENERATSIYA.md § 6.4
     */
    public function run(): void
    {
        $plans = [
            [
                'slug' => 'trial',
                'name' => 'Sinov',
                'price_uzs' => 0,
                'duration_days' => 7,
                'generation_limit' => 3,
                'features' => ['editor' => true, 'all_subjects' => true],
            ],
            [
                'slug' => 'basic',
                'name' => 'Asosiy',
                'price_uzs' => 59000,
                'duration_days' => 30,
                'generation_limit' => 30,
                'features' => ['editor' => true, 'all_subjects' => true],
            ],
            [
                'slug' => 'pro',
                'name' => 'Pro',
                'price_uzs' => 99000,
                'duration_days' => 30,
                'generation_limit' => 100,
                'features' => ['editor' => true, 'all_subjects' => true],
            ],
            [
                'slug' => 'pro_yearly',
                'name' => 'Yillik Pro',
                'price_uzs' => 890000,
                'duration_days' => 365,
                'generation_limit' => 1200,
                'features' => ['editor' => true, 'all_subjects' => true],
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan + ['is_active' => true]
            );
        }
    }
}
