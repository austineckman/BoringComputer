<?php

use function Livewire\Volt\{state, on, action};

state(['project', 'file_id']);

on(['file-created' => function () {
    $this->dispatch('$refresh');
}]);



?>

<div x-data="{expanded:false, diagram:false}"
     class="flex flex-row justify-between border-base-200-content border-b block content-center relative min-h-12">
    <div class="overflow-x-scroll flex-grow ">
        <ul class="menu menu-horizontal menu-compact menu-sm flex-nowrap">
            @foreach($project->files as $file)
                <livewire:project.menu.file-tab :file="$file" wire:key="'menu-top{{$file->id}}"></livewire:project.menu.file-tab>
            @endforeach
            <li :class="diagram ? 'text-primary font-bold':'text-base-content'"
                x-init="$watch('diagram', value => value ? $dispatch('populate-ide',{fileId:'{{'diagram'}}'}):null); $dispatch('file-selected', {id:'{{'diagram'}}' }); diagram = true;">
                <div
                     @click="$dispatch('file-selected', {id:'{{'diagram'}}' })"
                     @file-selected.window="diagram=$event.detail.id === 'diagram'"
                     class="flex flex-row content-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-8.25ZM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" />
                </svg>
                diagram.json
                </div>
            </li>
        </ul>
    </div>
    <ul class="menu menu-horizontal menu-sm absolute bg-base-100 flex-nowrap inset-y-0 right-0">
        <livewire:project.menu.delete-button></livewire:project.menu.delete-button>
        <li>
            <a x-on:click="$dispatch('ide-expand'); expanded = !expanded">
                <svg x-show="!expanded" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke-width="1.5"
                     stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5"/>
                </svg>
                <svg x-show="expanded" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke-width="1.5"
                     stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5"/>
                </svg>
            </a>
        </li>
    </ul>
</div>
