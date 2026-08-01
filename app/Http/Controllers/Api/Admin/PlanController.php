<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Plan;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::where('is_active', true)
            ->orderBy('price_uzs')
            ->get(['id', 'name', 'price_uzs', 'duration_days', 'generation_limit']);

        return response()->json(['data' => $plans]);
    }
}
