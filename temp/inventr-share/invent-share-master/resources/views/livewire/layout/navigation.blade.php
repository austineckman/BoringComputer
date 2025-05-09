<?php

use App\Livewire\Actions\Logout;
use App\Models\Kit;
use App\Models\Project;
use \GuzzleHttp\Utils;
use \Illuminate\Support\Facades\Auth;

$logout = function (Logout $logout) {
    $logout();

    $this->redirect('/', navigate: true);
};


$create = function () {
//    $project = Project::factory(1)->create()->first();
    //get the user_id from this project for the new project.
    $project = new Project();
    $project->name = 'New Project';
    $project->draft = true;
    $project->featured = false;
    $project->data = Utils::jsonEncode([
        //"author" => Auth::user()->email,
        "version" => "2.0",
        "schema" => "inventr1",
        //"name" => "New Project",
        "notes" => "",
        "keywords" => "",
        "libraries" => [],
        "components" => [],
        "connections" => [],
        "diagram" => ["viewport" => ["offset" => ["x" => 0,"y" => 0], "zoom" => 1]],
    ]);
    $project->thumb = 'images/arduino-diagram.png';
    $project->kit_id = Kit::all()->first()->id;
    $project->user_id = Auth::check()? Auth::user()->id : null;
    $project->save();
    $this->redirect('/project/'.$project->id, navigate: true);
};

?>

<nav x-data="{ open: false }" class="bg-base-100">
    <div  class="navbar bg-base-100 drop-shadow-lg mb-4 px-8">
        <div class="navbar-start">
            <a href="{{route('welcome')}}">
                <img src="{{asset('/images/inventr-logo.png')}}" class="h-6">
            </a>

{{--            <a href="{{env('FORUM_LINK')}}" class="sm:w-1/3 bg-white flex items-center">--}}
{{--                <p class="uppercase font-bold sm:text-2xl whitespace-nowrap"><span class="text-primary">Go</span> to forum</p>--}}
{{--                <img class="object-contain md:object-scale-down w-16 ml-2" src="{{ asset('/images/astronaut-forum.png') }}">--}}
{{--            </a>--}}
        </div>

        <div class="navbar-center">
            <div class="font-display font-bold">Project Creator</div>
        </div>

        <div class="navbar-end space-x-8 relative">
            <div class="flex flex-row space-x-4 justify-end items-center flex-grow">
                <button id="saveProjectBtn" class="btn btn-ghost btn-sm text-primary font-display" wire:click="create">New Project
                </button>
            </div>

            @if(!auth()->check())
                <a href="{{route('login')}}" class="font-display">Login</a>
                <a href="{{route('register')}}" class="btn btn-primary font-display">Create Account</a>
            @endif

            @if(auth()->check())
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
                <!-- Hamburger -->
                <div class="-me-2 flex items-center sm:hidden">
                    <button @click="open = ! open"
                            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out">
                        <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <path :class="{'hidden': open, 'inline-flex': ! open }" class="inline-flex"
                                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                  d="M4 6h16M4 12h16M4 18h16"/>
                            <path :class="{'hidden': ! open, 'inline-flex': open }" class="hidden"
                                  stroke-linecap="round"
                                  stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
            @endif
        </div>

    </div>
    <div>
        @if(auth()->check())
            <!-- Responsive Navigation Menu -->
            <div :class="{'block': open, 'hidden': ! open}"
                 class="hidden sm:hidden absolute inset-0 z-50 top-20 bg-base-100">
                <!-- Responsive Settings Options -->
                <div class="pt-4 pb-1 border-t border-gray-200 bg-base-100">
                    <div class="px-4">
                        <div class="font-medium text-base text-gray-800"
                             x-data="{{ json_encode(['name' => auth()->user()->name]) }}" x-text="name"
                             x-on:profile-updated.window="name = $event.detail.name"></div>
                        <div class="font-medium text-sm text-gray-500">{{ auth()->user()->email }}</div>
                    </div>

                    <div class="mt-3 space-y-1">
                        <x-responsive-nav-link :href="route('profile')" wire:navigate>
                            {{ __('Profile') }}
                        </x-responsive-nav-link>

                        <x-dropdown-link :href="config('app.forum_link')" wire:navigate>
                            {{ __('Forum') }}
                        </x-dropdown-link>

                        <!-- Authentication -->
                        <button wire:click="logout" class="w-full text-start">
                            <x-responsive-nav-link>
                                {{ __('Log Out') }}
                            </x-responsive-nav-link>
                        </button>
                    </div>
                </div>
            </div>
        @endif
    </div>
</nav>
