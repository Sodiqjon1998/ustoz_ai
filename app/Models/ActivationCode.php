<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivationCode extends Model
{
    protected $fillable = [
        'code', 'plan_id', 'status', 'used_by_user_id', 'used_at',
        'expires_at', 'created_by', 'batch_id', 'note',
    ];

    protected function casts(): array
    {
        return [
            'used_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function usedBy()
    {
        return $this->belongsTo(User::class, 'used_by_user_id');
    }

    public function isUsable(): bool
    {
        return $this->status === 'unused'
            && ($this->expires_at === null || $this->expires_at->isFuture());
    }
}
