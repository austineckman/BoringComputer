<?php

use function Livewire\Volt\{state, rules, action};

state(['project', 'name']);
rules(['name' => 'required']);

$submit = function () {
    $this->validate();

    $file             = new \App\Models\File();
    $file->project_id = $this->project->id;
    $file->data       = '//your code here';
    $file->name       = $this->name;
    $file->save();

    $this->dispatch('close-modal', name: 'upload_modal');
    $this->dispatch('file-created');
    $this->reset('name');
};

?>

<x-modal :name="'upload_modal'">
    <div x-data class="flex flex-col space-y-4 p-4">
        <h1 class="font-sans font-bold text-xl">Create a New File</h1>
        <p>
            Please enter a filename, without the file extension. Currently only <span class="font-bold">.ino</span>
            files types are supported.
        </p>
        <form wire:submit="submit">
            <input type="text"
                   @keydown.period.prevent=""
                   placeholder="Type the new file name here"
                   class="input input-bordered w-full max-w-md"
                   wire:model="name"
                   required
                   pattern="[a-zA-Z0-9\s]+"
            />
            <div class="text-error font-bold">@error('name') {{ $message }} @enderror</div>

            <div class="flex flex-row space-x-2 justify-end">
                <button class="btn btn-active btn-primary" type="submit">Create</button>
                <button type="reset" @click="$dispatch('close-modal',{name:'upload_modal'})" class="btn btn-outline btn-neutral">
                    Cancel
                </button>
            </div>
        </form>
    </div>
</x-modal>

