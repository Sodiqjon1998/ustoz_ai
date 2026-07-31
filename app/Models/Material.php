<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'material_set_id', 'type', 'disk', 'path', 'file_size',
        'checksum', 'template_key', 'render_ms',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function materialSet()
    {
        return $this->belongsTo(MaterialSet::class);
    }
}
