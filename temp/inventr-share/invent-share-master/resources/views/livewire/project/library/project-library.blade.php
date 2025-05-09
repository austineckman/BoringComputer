<?php

use function Livewire\Volt\{state, with, usesPagination, on};

usesPagination();

state(['project']);

with(fn() => ['projectLibraries' => $this->project->libraries]);

on(['libraryAdded' => function (\App\Models\Library $library) {
    if ($this->project->whereRelation('libraries', 'library_id', $library->id)->get()->count() === 0) {
        $this->project->libraries()->attach($library);
    }
}]);

$delete = function(\App\Models\Library $library){
    $this->project->libraries()->detach($library);
}

?>

<div class="p-4 bg-base-200 rounded-lg shadow-inner h-full space-y-4">
    @foreach($projectLibraries as $projectLibrary)
        <span
            wire:click="delete({{$projectLibrary}})"
                class="inline-flex items-center gap-x-0.5 rounded-md bg-success/10 px-2 py-1 text-sm font-medium text-success ring-1 ring-inset ring-success/10">
            {{$projectLibrary->name}}
          <button type="button" class="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-success/20">
            <span class="sr-only">Remove</span>
            <svg viewBox="0 0 14 14" class="h-3.5 w-3.5 stroke-primary/50 group-hover:stroke-success/75">
              <path d="M4 4l6 6m0-6l-6 6"/>
            </svg>
            <span class="absolute -inset-1"></span>
          </button>
        </span>
    @endforeach
</div>
