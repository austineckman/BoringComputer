<?php

namespace App\Http\Controllers\Kit;

use App\Http\Controllers\Controller;
use App\Models\Kit;

class KitController extends Controller
{
    public function __invoke()
    {
        $kits = Kit::all();
        return response()->json($kits);
    }
}
