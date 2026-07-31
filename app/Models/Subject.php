<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = [
        'slug', 'name_uz', 'name_ru', 'name_en', 'icon', 'color', 'theme_key',
        'grade_min', 'grade_max', 'default_language', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
