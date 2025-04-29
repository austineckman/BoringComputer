<?php
use function Livewire\Volt\{state, rules, mount};

rules(['name' => 'required|string']);

state(['project', 'name', 'isLoading', 'inputMode']);

mount(function () {
    $this->name = $this->project->name;
    $this->isLoading = false;
    $this->inputMode = false;
});


$updateName = function () {
    $this->isLoading = true;
    $this->resetValidation('name');

    if (!$this->validate()) {
        $this->isLoading = false;
    } else{
        $this->project->name = $this->name;
        $this->project->save();
        $this->dispatch('project-saved');
        $this->isLoading = false;
    }
};

$cancelEdit = function () {
    $this->name = $this->project->name;
}

?>

<div class="flex flex-row items-center"
     @project-saved.window="inputMode = false; $dispatch('inputModeChange', inputMode, true);">

    <div x-show="!inputMode"
         x-on:click="inputMode = true"
         class="font-display font-bold cursor-pointer"> {{$project->name ?? "New Project"}}</div>

    <form wire:submit.prevent="updateName" wire:reset.prevent="cancelEdit" x-show="inputMode" class="flex flex-row items-center flex-grow space-x-3">
        <label for="name" class="sr-only">Name</label>
        <div class="flex flex-col w-full">
            <input type="text" id="name"
                   wire:model.debounce.300ms="name"
                   class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset @error('name') ring-red-500 placeholder:text-red-400 @else ring-gray-400 placeholder:text-gray-400 @enderror focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                   placeholder=" @error('name') Name is required @else Your project name @enderror">
        </div>
        <button class="btn btn-sm" wire:loading.attr="disabled" type="submit">
            <svg wire:loading class="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
{{--                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>--}}
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Save
        </button>

        <button class="btn btn-sm" type="reset" x-on:click="inputMode = false;">Cancel</button>
    </form>
</div>
