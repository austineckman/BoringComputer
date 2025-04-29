<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('kits')->insert([
            [
                'name'        => 'Adventure Kit: 30 Days Lost in Space',
                'description' => 'The first, and the best!',
                'product_id'  => 1
            ]
        ]);
    }
}
