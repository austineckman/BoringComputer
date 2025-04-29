<?php

use function Livewire\Volt\{state};

state(['project']);

?>

<div x-data="{show_library:false}"
     x-show="show_library"
     @library.window="show_library=true"
     class="absolute z-10 inset-0 bg-base-200/70 p-4 h-full w-full flex flex-col items-center justify-center">
    <div class="bg-base-100 p-4 rounded-lg shadow-lg">
        <div class="flex flex-row justify-between col-span-2 pb-4">
            <div class="font-bold">Project Libraries</div>
            <button @click="show_library=false" class="btn btn-circle btn-outline btn-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                     stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        <div class="grid grid-cols-2">
            <livewire:project.library.library-search-panel></livewire:project.library.library-search-panel>
            <livewire:project.library.project-library :project="$project"></livewire:project.library.project-library>
        </div>
    </div>
</div>
