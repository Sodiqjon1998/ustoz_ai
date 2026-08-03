<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GenerationJob;
use App\Models\Lesson;
use App\Models\Material;
use App\Models\MaterialSet;
use App\Models\Subject;
use App\Services\Ai\GeminiService;
use App\Services\Cache\TopicNormalizer;
use App\Services\Generator\DocxOutlineBuilder;
use App\Services\Generator\GeneratorClient;
use App\Services\Generator\HandoutBuilder;
use App\Services\Generator\PresentationBuilder;
use App\Services\Generator\TestQuarterBuilder;
use App\Services\Generator\TestSimpleBuilder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class LessonController extends Controller
{
    public function index(Request $request)
    {
        $lessons = $request->user()->lessons()
            ->with(['subject:id,name_uz,icon,color', 'materialSet.materials:id,material_set_id,type,file_size'])
            ->latest()
            ->limit(20)
            ->get([
                'id', 'user_id', 'subject_id', 'material_set_id', 'grade', 'topic_raw',
                'duration', 'language', 'title', 'status', 'was_cache_hit',
                'created_at',
            ]);

        return response()->json(['data' => $lessons]);
    }

    public function store(
        Request $request,
        TopicNormalizer $normalizer,
        GeminiService $gemini,
        PresentationBuilder $presentationBuilder,
        DocxOutlineBuilder $docxOutlineBuilder,
        HandoutBuilder $handoutBuilder,
        TestSimpleBuilder $testSimpleBuilder,
        TestQuarterBuilder $testQuarterBuilder,
        GeneratorClient $generatorClient,
    ) {
        $data = $request->validate([
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'grade' => ['required', 'integer', 'min:1', 'max:11'],
            'topic' => ['required', 'string', 'min:2', 'max:200'],
            'duration' => ['required', 'integer', 'in:45,80'],
            'language' => ['required', 'string', 'in:uz,ru,en'],
        ]);

        $normalized = $normalizer->normalize($data['topic'], $data['language']);
        $cacheKey = $normalizer->cacheKey(
            $data['subject_id'],
            $data['grade'],
            $normalized,
            $data['duration'],
            $data['language'],
        );

        $materialSet = MaterialSet::where('cache_key', $cacheKey)
            ->where('status', 'ready')
            ->first();

        if ($materialSet) {
            $materialSet->increment('hit_count');

            $lesson = $request->user()->lessons()->create([
                'material_set_id' => $materialSet->id,
                'subject_id' => $data['subject_id'],
                'grade' => $data['grade'],
                'topic_raw' => $data['topic'],
                'duration' => $data['duration'],
                'language' => $data['language'],
                'title' => $materialSet->topic_display ?? $data['topic'],
                'status' => 'ready',
                'was_cache_hit' => true,
            ]);

            // Kesh-hit ham tarifning oylik dars-kvotasidan hisoblanadi — bu
            // AI xarajati emas, xizmatdan foydalanish chegarasi (CheckGenerationQuota
            // shu maydonni tekshiradi).
            $request->attributes->get('subscription')?->increment('generations_used');

            return response()->json([
                'data' => $lesson->load('subject:id,name_uz,icon,color'),
                'cache_hit' => true,
            ], 201);
        }

        $lesson = $request->user()->lessons()->create([
            'subject_id' => $data['subject_id'],
            'grade' => $data['grade'],
            'topic_raw' => $data['topic'],
            'duration' => $data['duration'],
            'language' => $data['language'],
            'title' => $data['topic'],
            'status' => 'generating',
            'was_cache_hit' => false,
        ]);

        $job = GenerationJob::create([
            'lesson_id' => $lesson->id,
            'status' => 'running',
            'started_at' => now(),
        ]);

        $subject = Subject::findOrFail($data['subject_id']);

        try {
            $content = $gemini->generateLessonContent(
                $subject,
                $data['grade'],
                $data['topic'],
                $data['duration'],
                $data['language'],
                $request->user()->gemini_api_key,
                $request->user()->gemini_api_key_2,
                $request->user()->id,
            );

            $materialSet = MaterialSet::create([
                'cache_key' => $cacheKey,
                'subject_id' => $data['subject_id'],
                'grade' => $data['grade'],
                'topic_raw' => $data['topic'],
                'topic_normalized' => $normalized,
                'topic_display' => $data['topic'],
                'duration' => $data['duration'],
                'language' => $data['language'],
                'variant' => 1,
                'content' => $content,
                'status' => 'ready',
                'ai_provider' => 'gemini',
                'ai_model' => config('services.gemini.model'),
            ]);

            $lesson->update([
                'material_set_id' => $materialSet->id,
                'status' => 'ready',
            ]);

            try {
                $presentation = $presentationBuilder->build(
                    $data['topic'],
                    $subject->name_uz,
                    $subject->theme_key,
                    $data['grade'],
                    $content,
                );

                $render = $generatorClient->renderPptx($presentation);

                Material::create([
                    'material_set_id' => $materialSet->id,
                    'type' => 'pptx',
                    'disk' => 'local',
                    'path' => 'generated/'.str_replace('\\', '/', $render['relative_path']),
                    'file_size' => $render['file_size'],
                ]);
            } catch (\Throwable $e) {
                // Matn materiali tayyor — PPTX bo'lmasa ham dars "tayyor" hisoblanadi,
                // faqat yuklab olish tugmasi ko'rinmaydi.
                Log::warning('PPTX generatsiyasi muvaffaqiyatsiz: '.$e->getMessage());
            }

            try {
                $outline = $docxOutlineBuilder->build(
                    $data['topic'],
                    $subject->name_uz,
                    $data['grade'],
                    $data['duration'],
                    $content,
                );

                $render = $generatorClient->renderDocx($outline);

                Material::create([
                    'material_set_id' => $materialSet->id,
                    'type' => 'docx',
                    'disk' => 'local',
                    'path' => 'generated/'.str_replace('\\', '/', $render['relative_path']),
                    'file_size' => $render['file_size'],
                ]);
            } catch (\Throwable $e) {
                Log::warning('DOCX generatsiyasi muvaffaqiyatsiz: '.$e->getMessage());
            }

            try {
                $handout = $handoutBuilder->build(
                    $data['topic'],
                    $subject->name_uz,
                    $subject->theme_key,
                    $data['grade'],
                    $data['duration'],
                    $content,
                );

                $render = $generatorClient->renderPdfHandout($handout);

                Material::create([
                    'material_set_id' => $materialSet->id,
                    'type' => 'pdf_handout',
                    'disk' => 'local',
                    'path' => 'generated/'.str_replace('\\', '/', $render['relative_path']),
                    'file_size' => $render['file_size'],
                ]);
            } catch (\Throwable $e) {
                Log::warning('PDF tarqatma generatsiyasi muvaffaqiyatsiz: '.$e->getMessage());
            }

            try {
                $testSimple = $testSimpleBuilder->build(
                    $data['topic'],
                    $subject->name_uz,
                    $data['grade'],
                    $content['test_questions'],
                );

                $render = $generatorClient->renderPdfTestSimple($testSimple);

                Material::create([
                    'material_set_id' => $materialSet->id,
                    'type' => 'pdf_test_simple',
                    'disk' => 'local',
                    'path' => 'generated/'.str_replace('\\', '/', $render['relative_path']),
                    'file_size' => $render['file_size'],
                ]);
            } catch (\Throwable $e) {
                Log::warning('PDF test (oddiy) generatsiyasi muvaffaqiyatsiz: '.$e->getMessage());
            }

            try {
                $testQuarter = $testQuarterBuilder->build(
                    $data['topic'],
                    $subject->name_uz,
                    $data['grade'],
                    $content['test_questions'],
                );

                $render = $generatorClient->renderPdfTestQuarter($testQuarter);

                Material::create([
                    'material_set_id' => $materialSet->id,
                    'type' => 'pdf_test_quarter',
                    'disk' => 'local',
                    'path' => 'generated/'.str_replace('\\', '/', $render['relative_path']),
                    'file_size' => $render['file_size'],
                ]);
            } catch (\Throwable $e) {
                Log::warning('PDF chorak testi generatsiyasi muvaffaqiyatsiz: '.$e->getMessage());
            }

            $job->update([
                'status' => 'done',
                'progress' => 100,
                'finished_at' => now(),
            ]);
        } catch (\Throwable $e) {
            $lesson->update(['status' => 'failed']);
            $job->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
                'finished_at' => now(),
            ]);

            return response()->json([
                'errors' => [[
                    'code' => 'GENERATION_FAILED',
                    'message' => $e->getMessage(),
                ]],
            ], 502);
        }

        $request->attributes->get('subscription')?->increment('generations_used');

        return response()->json([
            'data' => $lesson->fresh()->load('subject:id,name_uz,icon,color'),
            'cache_hit' => false,
        ], 201);
    }

    private const DOWNLOAD_EXTENSIONS = [
        'pptx' => 'pptx',
        'docx' => 'docx',
        'pdf_handout' => 'pdf',
        'pdf_test_simple' => 'pdf',
        'pdf_test_quarter' => 'pdf',
    ];

    public function download(Request $request, Lesson $lesson, string $type)
    {
        abort_if($lesson->user_id !== $request->user()->id, 403);
        abort_unless(array_key_exists($type, self::DOWNLOAD_EXTENSIONS), 404);

        $material = $lesson->materialSet?->materials()->where('type', $type)->first();

        abort_if(! $material, 404, 'Bu dars uchun fayl hali tayyor emas.');

        $extension = self::DOWNLOAD_EXTENSIONS[$type];

        return Storage::disk($material->disk)->download($material->path, "{$lesson->title}.{$extension}");
    }
}
