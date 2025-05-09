<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{


    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(UserSeeder::class);
        $this->call(KitSeeder::class);
        $this->call(ComponentsSeeder::class);
        Project::factory(40)->hasFiles(3)->create();

//        \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
    }
}
