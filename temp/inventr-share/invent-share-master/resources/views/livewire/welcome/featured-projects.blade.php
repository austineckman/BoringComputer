<?php

use App\Models\Project;
use function Livewire\Volt\{with, usesPagination};

usesPagination();

with(fn() => ['projects' =>
    Project::where('featured', true)
        ->where('draft', false)
        ->orderBy('created_at', 'desc')
        ->paginate(6, pageName: 'featured-page')]);

?>
<div class="p-8">
    <h2 class="text-2xl font-display text-primary">Featured Projects</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4">
        @foreach($projects as $project)
            <livewire:components.project-card :project="$project" wire:key="{{'featured'.$project->id}}"></livewire:components.project-card>
        @endforeach
    </div>
    <div class="flex flex-row justify-center py-8">
        {{$projects->links()}}
    </div>
</div>
