<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\AsArrayObject;
use Illuminate\Database\Eloquent\Casts\AsCollection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class Library extends Model
{

    use Searchable;

    protected $table    = 'libraries';
    protected $fillable = [
        'name',
        'version',
        'data'
    ];

    protected $casts = [
        'data' => AsCollection::class
    ];


    /**
     * Get the indexable data array for the model.
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {


        // Customize the data array...

        return [
            'name' => $this->name
        ];
    }

    public function projects()
    {
        return $this->belongsToMany(Project::class, 'libraries_projects');
    }

    use HasFactory;
}
