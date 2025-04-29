<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/


//Route::get('auth/redirect', \App\Http\Controllers\Auth\RedirectController::class)->name('login');
//Route::get('auth/callback', [\App\Http\Controllers\Auth\CallbackController::class, 'callback'])->name('auth.callback');
Route::get('/discourse-sso', [App\Http\Controllers\DiscourseSSOController::class, 'sso']);


Route::view('/', 'welcome')->name('welcome');

Route::view('dashboard', 'dashboard')
    ->middleware(['auth', 'admin'])
    ->name('dashboard');

Route::view('profile', 'profile')
    ->middleware(['auth'])
    ->name('profile');

Route::view('project', 'project')
    ->name('project_view');

Route::get('project/{project_id?}/{remix?}', \App\Http\Controllers\Project\ProjectController::class)->name('project');
Route::get('kits', \App\Http\Controllers\Kit\KitController::class)->name('kits');
Route::get('components', \App\Http\Controllers\Component\ComponentController::class)->name('components');

Route::get('/test-mail', function () {
    $details = [
        'title' => 'Mail from Laravel App',
        'body' => 'This is a test mail using Mailgun.'
    ];

    Mail::to('ralica@curiousm.com')->send(new \App\Mail\TestMail($details));

    return 'Mail sent!';
});

require __DIR__ . '/auth.php';
