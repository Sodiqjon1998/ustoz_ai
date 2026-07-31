<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaterialSet extends Model
{
    protected $fillable = [
        'cache_key', 'subject_id', 'grade', 'topic_raw', 'topic_normalized',
        'topic_display', 'duration', 'language', 'variant', 'content',
        'status', 'hit_count', 'rating_sum', 'rating_count',
        'ai_provider', 'ai_model', 'input_tokens', 'output_tokens',
        'cost_usd', 'generation_ms',
    ];

    protected function casts(): array
    {
        return [
            'content' => 'array',
        ];
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }

    public function materials()
    {
        return $this->hasMany(Material::class);
    }
}
