<?php

use function Livewire\Volt\{state};

state('project');

?>

<div :bind="open ? 'w-64':'w-8'" class="flex-col bg-base-200" x-data="{open:true}">
    <div class="flex flex-row border-b-2 border-base-200-content p-2 justify-between content-center p-4 h-14">
        <a href="{{route('welcome')}}">
            <img x-show="open" src="{{asset('/images/inventr-logo.png')}}" class="h-6">
        </a>
        <img x-on:click="open = !open" x-show="!open" src="{{asset('/images/inventr-logo-stacked.png')}}"
             class="h-6 cursor-pointer">
        <div class="btn btn-ghost btn-sm" x-on:click="open = !open" x-show="open">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/>
            </svg>
        </div>
    </div>
    <div x-show="open">
        <livewire:project.sidebar.project-nav :project="$project"></livewire:project.sidebar.project-nav>
    </div>
    <div x-show="!open">
        <livewire:project.sidebar.project-nav-small :project="$project"></livewire:project.sidebar.project-nav-small>
    </div>
</div>
