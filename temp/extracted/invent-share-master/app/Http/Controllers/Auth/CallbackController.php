<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Laravel\Socialite\Facades\Socialite;
use Nubs\RandomNameGenerator\All;

class CallbackController extends Controller
{
    /**
     * Invokes the method.
     *
     * This method gathers user data from the WordPress user object, creates a user in the database if it doesn't exist,
     * and logs the user in.
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function callback()
    {
        $wordpress_user = Socialite::driver('wordpress')->stateless()->user();

        $userData = $this->gatherUserData($wordpress_user);

        $user = User::firstOrCreate(
            ['email' => $wordpress_user->email],
            $userData
        );

        Auth::loginUsingId($user->id, true);

        Session::put('tuna','ok');

        if (session()->has('project_data')) {
            // Retrieve the project from the session
            $project = session('project_data');

            // Assign it to the logged in user
            auth()->user()->projects()->save($project);

            // Clear the project data from the session
            session()->forget('project_data');

            return redirect()->route('project', ['project_id' => $project->get('id')]);
        } else {
            return redirect()->route('profile');
        }
    }

    /**
     * Gather user data.
     *
     * @param $wordpress_user The WordPress user object.
     * @return array An array containing the user data.
     */
    private function gatherUserData($wordpress_user): array
    {
        return [
            'name'              => $wordpress_user->name,
            'display_name'      => $this->generateName(),
            'password'          => ' ',
            'email_verified_at' => Carbon::now()
        ];
    }

    /**
     * Generate a name.
     *
     * @return string The generated name.
     */
    private function generateName(): string
    {
        return All::create()->getName();
    }
}
