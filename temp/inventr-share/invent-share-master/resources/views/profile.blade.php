<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl leading-tight">
            {{ __('User Profile') }}
        </h2>
    </x-slot>

    <div class="py-8">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

            <div class="flex flex-col sm:flex-row gap-x-4 space-y-6 sm:space-y-0">
                <div class="w-full sm:w-2/3 sm:flex-grow">
                    <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg h-full">
                        <div class="max-w-xl">
                            <livewire:profile.update-profile-information-form />
                        </div>
                    </div>
                </div>
                <a href="{{env('FORUM_LINK')}}" class="w-full sm:w-1/3 p-4 sm:p-8 bg-white shadow sm:rounded-lg sm:flex-grow">
                    <div class="h-full flex flex-col items-center justify-center">
                        <p class="uppercase text-center font-bold sm:text-4xl"><span class="text-primary">Go</span> to forum</p>
                        <img class="p-4 object-contain md:object-scale-down w-64 m-auto" src="{{ asset('/images/astronaut-forum.png') }}">
                    </div>
                </a>
            </div>

            <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <livewire:profile.my-projects-form></livewire:profile.my-projects-form>
            </div>

            <div class="p-4 sm:p-8 bg-white shadow sm:rounded-lg">
                <div class="max-w-xl">
                    <livewire:profile.delete-user-form />
                </div>
            </div>

        </div>
    </div>
</x-app-layout>
