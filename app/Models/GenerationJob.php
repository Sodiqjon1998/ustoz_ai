<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GenerationJob extends Model
{
    protected $fillable = [
        'lesson_id', 'status', 'progress', 'current_step', 'attempts',
        'error_message', 'started_at', 'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
