<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $this->abortIfNotAdmin();

        return $next($request);
    }

    /**
     * Abort if the authenticated user is not an admin.
     */
    protected function abortIfNotAdmin(): void
    {
        if(!Auth::user()->admin){
            abort(403, 'Unauthorized');
        }
    }
}
