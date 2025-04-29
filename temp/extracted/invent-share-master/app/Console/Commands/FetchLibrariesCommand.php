<?php

namespace App\Console\Commands;

use App\Services\LibraryAPI\LibraryAPI;
use Illuminate\Console\Command;

class FetchLibrariesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fetch-libraries';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetches remote library content from the API.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $api = new LibraryAPI();
        $api->call();
    }
}
