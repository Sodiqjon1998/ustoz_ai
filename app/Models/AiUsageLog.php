<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiUsageLog extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id', 'lesson_id', 'material_set_id', 'provider', 'model', 'step',
        'input_tokens', 'output_tokens', 'cached_tokens', 'cost_usd',
        'latency_ms', 'cache_hit',
    ];

    protected function casts(): array
    {
        return [
            'cost_usd' => 'decimal:6',
            'cache_hit' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
