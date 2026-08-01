<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MaterialSet;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = Subject::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'slug', 'name_uz', 'name_ru', 'name_en', 'icon', 'color', 'grade_min', 'grade_max']);

        return response()->json(['data' => $subjects]);
    }

    /**
     * Berilgan fan+sinf uchun eng ko'p so'ralgan mavzular ("Mashhur mavzular"
     * taklifi, wizard 3-qadami). Faqat o'qish — hech qanday yon ta'sir yo'q.
     */
    public function popularTopics(Request $request, Subject $subject)
    {
        $data = $request->validate([
            'grade' => ['required', 'integer', 'min:1', 'max:11'],
        ]);

        $topics = MaterialSet::where('subject_id', $subject->id)
            ->where('grade', $data['grade'])
            ->where('status', 'ready')
            ->orderByDesc('hit_count')
            ->limit(6)
            ->get(['id', 'topic_display', 'topic_raw', 'hit_count'])
            ->map(fn ($m) => [
                'topic' => $m->topic_display ?? $m->topic_raw,
                'hit_count' => $m->hit_count,
            ]);

        return response()->json(['data' => $topics]);
    }
}
