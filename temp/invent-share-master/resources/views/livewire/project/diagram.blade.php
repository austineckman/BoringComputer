<?php

use function Livewire\Volt\{state, on};
use Illuminate\Support\Facades\Storage as Storage;
state(['project']);

on(['save-diagram' => function ($e) {
    try {
        $data = json_decode($e, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("Error on JSON decode: " . json_last_error_msg());
        }
//        dump($data); // Debug
        // Check if project object is a correct model instance
//        dump(get_class($this->project));  // Debug
        $this->project->data = $e;
        $this->project->save();
//        dump(json_decode($this->project->data));
        //save ide editor side.
        $this->dispatch('update-diagram', data:$this->project->data);
    } catch (\PHPUnit\Util\Exception $exception) {
//        dump($exception->getMessage());  // Debug
    }
}]);


on(['save-thumbnail' => function ($e) {
    try {
        $imageName = $this->project->id .'-thumb.'.'png';

        $imgData = str_replace('data:image/png;base64,','', $e);
        $path = 'staging-tests/'.$imageName;
        $uploadedPath = Storage::disk('s3')->put($path, base64_decode($imgData), 'public');
        if($uploadedPath === true){
            $this->project->thumb = Storage::disk('s3')->url($imageName);
            $this->project->save();
            $this->dispatch('project-saved');
//            dump($this->project->thumb, $this->project->id);
        }else{
           dump('Failed to save image to s3');
        }
    } catch (\PHPUnit\Util\Exception $exception) {
        dump($exception->getMessage());  // Debug
    }
}]);


?>
@push('scripts')
<script>
    document.addEventListener('data-update', function (e) {
        // console.log('Received custom event from React:', e.detail);
        Livewire.dispatch('save-diagram', [e.detail]);
    });
    document.addEventListener('expand-diagram', function () {
        Livewire.dispatch('diagram-expand');
    });
    document.addEventListener('save-thumbnail', function (e) {
        Livewire.dispatch('save-thumbnail', [e.detail]);
    });
</script>
@endpush

<div
    wire:ignore
    id="inventr-diagram"
    x-data="{expanded:false,diagramExpand:false}"
    @diagram-expand.window="diagramExpand=!diagramExpand"
    @ide-expand.window="expanded=!expanded"
    x-bind:class="(expanded ? 'hidden':'') + ' ' + (diagramExpand ? 'absolute inset-0':'')"
    class="flex flex-col bg-base-200 shadow-inner"
    data-content="{{json_encode($project)}}"></div>
{{--data-content="{{json_encode($project)}}"--}}

@stack('scripts')
