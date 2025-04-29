<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'name'              => 'Curious Minds Support',
                'email'             => 'support@curiousm.com',
                'password'          => Hash::make('password'),
                'email_verified_at' => Carbon::now(),
                'display_name'      => 'Curious Minds Support',
                'admin'             => true
            ],
            [
                'name'              => 'Alex Eschenauer',
                'email'             => 'alex@inventr.io',
                'password'          => Hash::make('password'),
                'email_verified_at' => Carbon::now(),
                'display_name'      => 'Alex',
                'admin'             => true
            ]
        ]);
    }
}
