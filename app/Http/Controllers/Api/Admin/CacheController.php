<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MaterialSet;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CacheController extends Controller
{
    public function index(Request $request)
    {
        $data = $request->validate([
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
            'sort' => ['nullable', 'string', 'in:hit_count,rating,newest'],
        ]);

        $sort = $data['sort'] ?? 'hit_count';

        $sets = MaterialSet::query()
            ->with('subject:id,name_uz')
            ->when($data['subject_id'] ?? null, fn ($q, $id) => $q->where('subject_id', $id))
            ->when($sort === 'rating', fn ($q) => $q->orderByRaw(
                'CASE WHEN rating_count > 0 THEN rating_sum::float / rating_count ELSE 0 END DESC'
            ))
            ->when($sort === 'newest', fn ($q) => $q->latest())
            ->when($sort === 'hit_count', fn ($q) => $q->orderByDesc('hit_count'))
            ->paginate(30, [
                'id', 'subject_id', 'grade', 'topic_display', 'topic_raw', 'duration', 'language',
                'status', 'hit_count', 'rating_sum', 'rating_count', 'cost_usd', 'created_at',
            ]);

        return response()->json([
            'data' => $sets->items(),
            'meta' => [
                'current_page' => $sets->currentPage(),
                'last_page' => $sets->lastPage(),
                'total' => $sets->total(),
            ],
        ]);
    }

    public function show(MaterialSet $cache)
    {
        return response()->json(['data' => $cache->load('subject:id,name_uz', 'materials')]);
    }

    public function destroy(MaterialSet $cache)
    {
        foreach ($cache->materials as $material) {
            Storage::disk($material->disk)->delete($material->path);
        }

        $cache->delete();

        return response()->json(['data' => ['message' => 'O\'chirildi.']]);
    }
}
