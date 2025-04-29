<?php

use function Livewire\Volt\{state, on, action};

state(['file_id']);

on(['init-code-editor' => function ($id) {
    $this->file_id = $id;
}]);

on(['file-closed'=> function () {
    $this->file_id= null;
}]);

$fileDelete = action(function(){
    $file = \App\Models\File::find($this->file_id);
    if($file){
        $file->delete();
        $this->dispatch('file-deleted');
        $this->dispatch('$refresh');
    }
});

?>

<li x-show="$wire.file_id !== null && $wire.file_id !== 'diagram'">
    <a
        wire:click="fileDelete()"
        wire:confirm="Really delete this file?"
        class="text-error">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
             stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
        </svg>
    </a>
</li>
