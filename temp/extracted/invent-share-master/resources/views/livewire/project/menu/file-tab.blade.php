<?php

use function Livewire\Volt\{state,action};

state('file');


?>

<li
    x-data="{visible:true, selected:false, id:{{$file->id}}}"
    {{-- Set component to visible--}}
    x-init="$watch('selected', value => value ? $dispatch('populate-ide',{fileId:'{{$file->id}}'}):null)"
    x-show="visible"
    @file-visible.window="!visible ? visible = $event.detail.id == '{{$file->id}}': visible; selected = $event.detail.id == '{{$file->id}}'"
    @file-selected.window="$event.detail.id === '{{$file->id}}' ? selected = true : selected = false;">

    <a :class="selected ? 'text-primary font-bold':''"
       @click="$dispatch('file-selected', {id:'{{$file->id}}' })">
        {{$file->name ?? "file_name.ico"}}
        {{-- File Close Button--}}
        <div class="cursor-pointer rounded-full hover:bg-base-300 hover:text-primary-content p-1"
             @click.stop="visible=false; selected=false;$dispatch('file-closed', {id:'{{$file->id}}', selected:selected });">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
            </svg>
        </div>
    </a>
</li>
