<?php

namespace Database\Factories;

use App\Models\Kit;
use App\Models\User;
use GuzzleHttp\Utils;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        return [
            'name'     => fake()->sentence(4),
            'draft'    => fake()->boolean(),
            'data' => Utils::jsonEncode([
//                "author" => "example@thisurl.com",
                "version" => "2.0",
                "schema" => "inventr1",
//                "name" => fake()->sentence(4),
                "notes" => "this is a test project, feel free to delete",
                "keywords" => "some,list,of,searchable",
                "libraries" => [],
                "components" => [],
                "connections" => [],
                "diagram" => ["viewport" => ["offset" => ["x" => 0,"y" => 0], "zoom" => 1]],
            ]),
            'thumb'    => 'images/arduino-diagram.png',
            'kit_id'   => Kit::all()->first()->id,
            'user_id'  => User::all()->first()->id,
            'featured' => fake()->boolean(),
        ];
    }
}
