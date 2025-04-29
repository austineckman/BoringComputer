<?php
use function Livewire\Volt\{state};
state(['project']);

?>

<div class="card w-full bg-base-100 shadow-xl font-sans text-base-content">
    <div class="card-body flex flex-row justify-between">
        <div>
            <h2 class="card-title font-bold">{{$project->name ?? "Flux capacitor V1"}}</h2>
            <p class="text-base-300 text-sm">{{$project->kit->name ?? "30 days lost in space"}}</p>
        </div>
        <div class="text-base-300 text-sm text-right">
            {{$project->user->display_name ?? "Doc Brown"}} {{$project->created_at ?? \Illuminate\Support\Carbon::now()->format('d/m/y')}}
        </div>
    </div>
    <figure class="shadow-inner bg-base-200 p-4">
        <img src="{{asset($project->thumb?? 'images/arduino-diagram.png')}}" alt="Project snapshot" style="max-height:16rem;" />
    </figure>
    <div class="card-actions justify-end items-center p-2">
        <a href="{{route('project', ['project_id'=>$project, 'remix'=>!(auth()->check() && auth()->user()->can('update', $project))])}}" class="btn btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                 stroke="currentColor" class="w-6 h-6 text-primary">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5"/>
            </svg>
            <span class="text-primary">
                @if(!(auth()->check() && auth()->user()->can('update', $project)))
                remix this project
                @else
                view this project
                @endif
            </span>
        </a>
    </div>
</div>
