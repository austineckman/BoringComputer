<?php

namespace App\Http\Controllers\Component;

use App\Http\Controllers\Controller;
use App\Models\Component;

class ComponentController extends Controller
{
    public function __invoke()
    {
        $components = Component::all();
        return response()->json($components);
    }
}
