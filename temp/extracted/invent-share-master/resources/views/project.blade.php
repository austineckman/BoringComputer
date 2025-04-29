<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{config('app.name','Inventr')}}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=quicksand:400,500,600&display=swap" rel="stylesheet"/>
    <link href="https://fonts.bunny.net/css?family=orbitron:400,500,600&display=swap" rel="stylesheet"/>

    <!-- Scripts -->
    <style type="text/css" media="screen">
        #editor {
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
        }
    </style>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])

    <script src="{{asset('/ace-builds/src-min-noconflict/ace.js')}}" type="text/javascript" charset="utf-8"></script>

</head>
<body class="antialiased bg-base-100 flex flex-row h-screen w-full">

@php
    if (!Auth::check()) {
        session()->put('project_data', $project);
    }
@endphp


<livewire:project.sidebar :project="$project"></livewire:project.sidebar>
<div class="flex flex-col bg-base-100 flex-grow">
    <livewire:project.navbar :project="$project"></livewire:project.navbar>
    <div class="grid grid-cols-2 h-full relative">
        <livewire:project.library-modal :project="$project"></livewire:project.library-modal>
        {{--Code Builder--}}
        <livewire:project.ide :project="$project"></livewire:project.ide>
        {{-- Diagram Builder--}}
        <livewire:project.diagram :project="$project"></livewire:project.diagram>
    </div>
</div>
<livewire:project.create-file-dialog :project="$project"/>

</body>
</html>
