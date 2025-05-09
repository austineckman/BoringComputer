<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DiscourseSSOController extends Controller
{
    public function sso(Request $request)
    {
        $ssoSecret = env('DISCOURSE_SSO_SECRET');
        $sso = $request->get('sso');
        $sig = $request->get('sig');

        // Validate the SSO payload
        if (hash_hmac('sha256', $sso, $ssoSecret) !== $sig) {
            abort(403, 'Invalid SSO request');
        }

        // Decode the payload
        parse_str(base64_decode($sso), $payload);

        // Store the return SSO URL in the session
        $request->session()->put('return_sso_url', $payload['return_sso_url']);
        $request->session()->put('sso_payload', $sso);
        $request->session()->put('sso_sig', $sig);

        // Ensure user is authenticated in Laravel
        if (!Auth::check()) {
            // Redirect to your login page
            return redirect()->route('login')->with('redirect_to', $request->fullUrl());
        }

        return $this->completeSso($request);
    }

    private function completeSso(Request $request)
    {
        $ssoSecret = env('DISCOURSE_SSO_SECRET');
        $sso = $request->session()->get('sso_payload');
        $payload = [];
        parse_str(base64_decode($sso), $payload);

        $user = Auth::user();
        $nonce = $payload['nonce'];
        $returnPayload = [
            'nonce' => $nonce,
            'email' => $user->email,
            'external_id' => $user->id,
            'username' => $user->name,
            'name' => $user->name,
        ];

        $queryString = http_build_query($returnPayload);
        $base64Payload = base64_encode($queryString);
        $returnSig = hash_hmac('sha256', $base64Payload, $ssoSecret);

        return redirect($payload['return_sso_url'] . '?' . http_build_query([
                'sso' => $base64Payload,
                'sig' => $returnSig,
            ]));
    }
}

