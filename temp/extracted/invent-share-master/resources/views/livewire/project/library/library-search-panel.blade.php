<?php

use function Livewire\Volt\{state, with, usesPagination};


usesPagination();

state(['term' => null]);


with(fn() => ['libraries' => \App\Models\Library::search($this->term)->orderBy('name')->simplePaginate(30)]);

$search   = fn() => $this->resetPage();
$selected = fn($library) => $this->dispatch('libraryAdded', library: $library)

?>

<div class="p-4 bg-base-100 flex flex-col">
    <form wire:submit="search" class="flex flex-row justify-between items-baseline space-x-3 pb-6">
        <div class="flex flex-row items-baseline space-x-3">
            <div class="relative mt-2 rounded-md shadow-sm">
                <input wire:model="term" type="text"
                       class="block w-full rounded-md border-0 py-1.5 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-base-300 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                       placeholder="Filter by library name">
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                         stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>
                    </svg>
                </div>
            </div>

            <button type="submit" class="btn btn-primary btn-sm">Search</button>
        </div>
    </form>

    <div class="overflow-y-scroll h-96 px-2">
    <ul role="list" class="divide-y divide-gray-100">
        @foreach($libraries as $library)
            <li class="flex justify-between gap-x-6 py-5 hover:bg-base-200 px-2 cursor-pointer" wire:click="selected({{$library}})">
                <div class=" min-w-0 gap-x-4">
                    <div class="min-w-0 flex-auto">
                        <p class="text-sm font-semibold leading-6">{{$library->name}}</p>
                        <p class="mt-1  text-sm leading-5">{{$library->data['sentence']}}</p>
                    </div>
                </div>
                <div class="shrink-0 flex flex-col justify-between sm:items-end">
                    <p class="text-sm leading-6 text-gray-900">{{$library->version}}</p>
                    <p class="text-xs">{{$library->data['category']}}</p>
                </div>
            </li>
        @endforeach
    </ul>

    </div>
    <div class="flex flex-row w-full justify-center">
        <div class="px-6 py-4">
            {{ $libraries->links() }}
        </div>
    </div>
</div>

