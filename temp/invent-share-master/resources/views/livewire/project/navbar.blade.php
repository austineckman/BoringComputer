<?php

use function Livewire\Volt\{state};
use App\Livewire\Actions\Logout;
use App\Models\Kit;
use App\Models\Project;
use \GuzzleHttp\Utils;
use \Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

state('project');

$logout = function (Logout $logout) {
    $logout();

    $this->redirect('/', navigate: true);
};

$save = function () {
    // If user is logged in
    if (auth()->check()) {
        if (auth()->user()->id === $this->project->user_id) {
            $this->project->save();
        }
    }
    // If user is not logged in
    else {
        // Store the project data in the session
        session(['project_data' => $this->project]);

        // Redirect to login page
        return redirect('login');
    }
};

$login = function () {

    // If user is logged in
    if (auth()->check()) {
        if (auth()->user()->id === $this->project->user_id) {
            $this->project->save();
        }
    }

    // If user is not logged in
    else {
        // Store the project data in the session
        session(['project_data' => $this->project]);
    }

    // Redirect to login page
    return redirect('login');
};

$handlePublish = function () {
    $this->project->draft = !$this->project->draft;
    $this->project->save();
};

$create = function () {
    $project = new Project();
    $project->name = 'New Project';
    $project->draft = true;
    $project->featured = false;
    $project->data = Utils::jsonEncode([
        "version" => "2.0",
        "schema" => "inventr1",
        "notes" => "",
        "keywords" => "",
        "libraries" => [],
        "components" => [],
        "connections" => [],
        "diagram" => ["viewport" => ["offset" => ["x" => 0,"y" => 0], "zoom" => 1]],
    ]);
    $project->thumb = 'images/arduino-diagram.png';
    $project->kit_id = Kit::all()->first()->id;//hardcoded as we only have 1 kit atm.

    if (auth()->check()) {
        $project->user_id = Auth::user()->id;
        $project->save();
    }
    // If user is not logged in
    else {
        // Store the project data in the session
        session(['project_data' => $this->project]);
    }

    $this->redirect('/project/'.$project->id, navigate: false);
};


?>

<nav class="flex flex-row border-b border-base-200-content p-2 justify-between items-center p-4 w-full h-14 space-x-8">
    @if(Auth::check())
        <div class="flex flex-row space-x-8"
             x-data="{inputMode: false}">

            <livewire:project.project-name-input :project="$project"
                                                 @inputModeChange="console.log('inputModeChange', $event.detail);"
            ></livewire:project.project-name-input>

            <div x-show="!inputMode"
                 class="flex flex-row space-x-4 justify-start items-center flex-grow">
                <button id="saveProjectBtn"
                        wire:loading.attr="disabled"
                        wire:click="save"
                        class="btn btn-success btn-sm text-primary-content font-display" >
                    <svg wire:loading class="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
{{--                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>--}}
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Save Project
                </button>

                <button wire:loading.attr="disabled"
                        wire:click="handlePublish"
                        class="btn btn-sm font-display" >
                    <svg wire:loading class="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    @if(!$project->draft)
                        Published
                    @else
                        Draft
                    @endif
                </button>
            </div>
        </div>
    @else
        <div class="font-display font-bold cursor-pointer"> {{$project->name ?? "New Project"}}</div>
        <button disabled class="btn btn-success btn-sm font-display disabled:text-green-600">Login to save this project</button>
    @endif

    <div class="flex flex-row space-x-4 items-center">

        @if(!auth()->check())

            <a wire:click="login" class="btn btn-ghost font-display uppercase text-primary font-bold">Login</a>

            <a href="{{route('register')}}" class="btn btn-primary btn-sm font-display">Create Account</a>

        @else
            <div class="flex flex-row space-x-4 justify-start items-center flex-grow">

                <button class="btn btn-ghost btn-sm text-primary font-display" wire:click="create">New Project
                </button>

            </div>
            <!-- Settings Dropdown -->
            <div class="hidden sm:flex sm:items-center sm:ms-6">
                <x-dropdown align="right" width="48">
                    <x-slot name="trigger">
                        <button
                            class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150">
                            <div x-data="{{ json_encode(['name' => auth()->user()->name]) }}" x-text="name"
                                 x-on:profile-updated.window="name = $event.detail.name"></div>
                            <div class="ms-1">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                     viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                          clip-rule="evenodd"/>
                                </svg>
                            </div>
                        </button>
                    </x-slot>

                    <x-slot name="content">
                        <x-dropdown-link :href="route('profile')" wire:navigate>
                            {{ __('Profile') }}
                        </x-dropdown-link>

                        <x-dropdown-link :href="config('app.forum_link')" target="_blank">
                            {{ __('Forum') }}
                        </x-dropdown-link>

                        <!-- Authentication -->
                        <button wire:click="logout" class="w-full text-start">
                            <x-dropdown-link>
                                {{ __('Log Out') }}
                            </x-dropdown-link>
                        </button>
                    </x-slot>
                </x-dropdown>
            </div>
        @endif
    </div>
</nav>
