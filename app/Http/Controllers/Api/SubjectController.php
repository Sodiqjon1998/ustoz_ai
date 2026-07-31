<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subject;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = Subject::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'slug', 'name_uz', 'name_ru', 'name_en', 'icon', 'color', 'grade_min', 'grade_max']);

        return response()->json(['data' => $subjects]);
    }
}
