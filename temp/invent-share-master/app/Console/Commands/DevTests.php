<?php

namespace App\Console\Commands;

use App\Models\Project;
use App\Services\LibraryAPI\LibraryAPI;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DevTests extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'dev:test';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Development service commands.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $projects = Project::all();
        DB::beginTransaction();

        try {
            foreach($projects as $project) {
                $data = json_decode($project->data, true);

                // If the data is null just skip this iteration
                if ($data === null) {
                    continue;
                }

                unset($data['author'], $data['name']);

                // Then we set the updated data back as a JSON string again
                $project->data = json_encode($data);
                $project->save();
            }
            DB::commit();

            echo "Update completed successfully.";
        } catch (\Throwable $e) {
            DB::rollBack();
            echo sprintf("Error occurred during update: %s", $e->getMessage());
        }
    }
}
