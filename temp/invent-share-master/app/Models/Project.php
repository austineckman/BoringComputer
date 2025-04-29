<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasFactory,SoftDeletes;

    protected $casts = [
        //  'data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function kit()
    {
        return $this->belongsTo(Kit::class);
    }

    public function files()
    {
        return $this->hasMany(File::class);
    }

    public function libraries(){
        return $this->belongsToMany(Library::class,'libraries_projects');
    }

}
