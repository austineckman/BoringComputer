<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;

    protected function name(): Attribute
    {
        return Attribute::make(
            set: static fn(string $value) => !str_contains($value,'.') ? $value.'.ino' : $value,
        );
    }

}
