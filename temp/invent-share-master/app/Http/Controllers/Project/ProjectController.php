<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    private Project $project;

    public function __invoke($project_id = null, $remix = false)
    {
        //Does this project exist?
        $this->project = Project::findOrFail($project_id);

        //is the user logged in and allowed to access the project?
        if (Auth::check() && Auth::user()->can('update', $this->project)) {
            return view('project', data: ['project' => $this->project]);
        }
        else if($remix === '1') {
            $duplicateProject = $this->duplicateProject($this->project);
            return redirect()->route('project', ['project_id' => $duplicateProject->id]);
        }

        // The user just wants to view the project, show the read-only view
        return view('project', data: ['project' => $this->project]);
    }

    private function duplicateProject(Project $project)
    {
        $replica = $project->replicate();

        if (Auth::check()) {
            $replica->user()->associate(Auth::user());
        } else {
            $replica->user_id = null;
        }
        $replica->draft = true;
        $replica->featured = false;
        $replica->save();

        foreach ($project->files as $file) {
            $clonedFile = $file->replicate();
            $replica->files()->save($clonedFile);
        }

        $replica->libraries()->sync($project->libraries);
        return $replica;
    }
}
