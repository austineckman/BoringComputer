<?php

use App\Models\Project;
use function Livewire\Volt\{state, with, usesPagination};

usesPagination();
with(fn() => ['projects' => Project::orderBy('updated_at','DESC')
    ->where('featured', false)
    ->where('draft', false)
    ->paginate(6, pageName:'recent-page') ]);

?>

<div class="pt-8 px-10 space-y-8">
    <h2 class="text-2xl font-display text-primary">Recent Projects</h2>
{{--    <select class="select select-ghost w-full max-w-xs text-primary">--}}
{{--        <option disabled selected>Filter by kit</option>--}}
{{--        <option>Svelte</option>--}}
{{--        <option>Vue</option>--}}
{{--        <option>React</option>--}}
{{--    </select>--}}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-4">
        @foreach($projects as $project)
        <livewire:components.project-card :project="$project" wire:key="'rec'.{{ $project->id }}"></livewire:components.project-card>
        @endforeach
    </div>
    <div class="flex flex-row justify-center py-8">
        {{$projects->links()}}
    </div>
</div>
