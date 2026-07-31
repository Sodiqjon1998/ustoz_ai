<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    protected $fillable = [
        'user_id', 'material_set_id', 'subject_id', 'grade', 'topic_raw',
        'duration', 'language', 'title', 'status', 'was_cache_hit', 'planned_date',
    ];

    protected function casts(): array
    {
        return [
            'was_cache_hit' => 'boolean',
            'planned_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function materialSet()
    {
        return $this->belongsTo(MaterialSet::class);
    }

    public function generationJob()
    {
        return $this->hasOne(GenerationJob::class);
    }
}
