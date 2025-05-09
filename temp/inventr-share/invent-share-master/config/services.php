<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'wordpress' => [
        // Endpoint for Self-hosted WordPress
        'host'   => env('WORDPRESS_HOST'),
        'api_me' => env('WORDPRESS_API_ME', env('WORDPRESS_HOST') . '/me/'),

        'client_id'     => env('WORDPRESS_CLIENT_ID'),
        'client_secret' => env('WORDPRESS_CLIENT_SECRET'),
        'redirect'      => env('WORDPRESS_REDIRECT'),
    ],

    'library' => [
        'url_endpoint'=>env('LIBRARY_API_ENDPOINT')
    ]

];
