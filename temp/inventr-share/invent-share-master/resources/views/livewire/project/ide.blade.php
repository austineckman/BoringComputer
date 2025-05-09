<?php

use function Livewire\Volt\{state, action, on};


state(['project', 'file']);

$populateIde = action(function ($fileId) {
    if($fileId === 'diagram'){
        $this->dispatch('init-diagram-editor', data: $this->project->data, id:'diagram');
        $this->dispatch('init-code-editor', data: null, id:null);
    } else {
        $this->file = \App\Models\File::find($fileId);
        $this->dispatch('init-code-editor', data: $this->file->data, id:$this->file->id);
    }
})->renderless();

$saveIdeContents = action(function ($data) {
    $this->file->data = $data;
    $this->file->save();
})->renderless();

$updateDiagramObject = action(function ($data) {
    $newData = json_decode($data);
    dump($newData);
    $pData = json_decode($this->project->data);
    $pData->components = $newData->components;
    $pData->connections = $newData->connections;
    $this->project->data = json_encode($pData);
    $this->project->save();
})->renderless();

?>

<div
    x-data="{expanded:false, diagramExpand:false}"
    @diagram-expand.window="diagramExpand=!diagramExpand"
    @ide-expand.window="expanded=!expanded"
    @populate-ide.window="$wire.populateIde(event.detail.fileId)"
    x-bind:class="(expanded ? 'absolute inset-0':'') + ' ' + (diagramExpand ? 'hidden':'')"
    class="bg-base-100 flex flex-col">
    <livewire:project.menu :project="$project"></livewire:project.menu>
    <div x-show="!diagramExpand" class="relative h-full">
        <div id="editor">

        </div>
    </div>
    <div x-show="diagramExpand" class="relative h-full">
        <div id="diagramEditor">

        </div>
    </div>
</div>

@script

<script>
    let editor = ace.edit("editor");
    let activeFileId = null;
    editor.setTheme("ace/theme/xcode");
    editor.session.setMode("ace/mode/arduino");

    document.addEventListener('file-closed', (e) => {
        editor.session.removeAllListeners('change');
        editor.session.setValue(" ");
    });

    Livewire.on('init-code-editor', ({data}) => {
        if(!data) return;
        console.log('init editor');
        console.log(data);
        let code = ace.createEditSession(data);
        editor.setSession(code);
        editor.setReadOnly(false);
        editor.session.setMode("ace/mode/arduino");

        activeFileId = 'file';

        //Add the event listeners to save the content
        editor.getSession().on('change', function () {
            $wire.saveIdeContents(editor.getSession().getValue());
        });
    });

    Livewire.on('init-diagram-editor', ({data}) => {
        // console.log('init diagram editor');
        let json = JSON.parse(data);
        let prettifiedJson = JSON.stringify(json, null, 4); // indenting with 4 spaces
        let code = ace.createEditSession(prettifiedJson);
        editor.setSession(code);
        editor.setReadOnly(true);  // true means the editor is read-only
        editor.session.setMode("ace/mode/arduino");
        activeFileId = 'diagram';
        //Add the event listeners to save the content
        // editor.getSession().on('change', function () {
        //     $wire.updateDiagramObject(JSON.parse(editor.getSession().getValue()));
        // });
    });

    /**
     * The diagram object has been altered elsewhere in the application and the ide needs to reflect the new data.
     * This method is responsible for updating the diagram data in the ide.
     */
    Livewire.on('update-diagram', ({data}) => {
        if (activeFileId !== 'diagram') {
            // The current view is not the diagram file, so we ignore this update
            return;
        }
        console.log('on update-diagram');
        let json = JSON.parse(data);

        let prettifiedJson = JSON.stringify(json, null, 4); // indenting with 4 spaces
        editor.session.setValue(prettifiedJson);
    });


</script>
@endscript

