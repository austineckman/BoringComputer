<?php

namespace App\Services\LibraryAPI;

use App\Contracts\LibraryAPI\LibraryAPIContract;
use App\Exceptions\LibraryEndpointMissingException;
use App\Models\Library;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\DB;

class LibraryAPI implements LibraryAPIContract
{
    private string $api_url_endpoint;

    /**
     * @throws LibraryEndpointMissingException
     */
    public function __construct()
    {
        $this->initializeApiEndpoint();
    }

    /**
     * @throws LibraryEndpointMissingException
     */
    private function initializeApiEndpoint(): void
    {
        $this->api_url_endpoint = config('services.library.url_endpoint', null);
        $this->ensureApiEndpointExists();
    }

    /**
     * @throws LibraryEndpointMissingException
     * @noinspection PhpConditionAlreadyCheckedInspection
     */
    private function ensureApiEndpointExists(): void
    {
        if ($this->api_url_endpoint === null) {
            throw new LibraryEndpointMissingException('The Library API endpoint is missing, please check your environment file');
        }
    }

    public function call()
    {
        // Initialize a Guzzle client
        $client = new Client();

        // Make a http get request to the api url endpoint
        $response = $client->request('GET', $this->api_url_endpoint);

        // Return the response
        $mapped_result = $this->mapResults([... json_decode($response->getBody(), true)]['libraries']);
        $this->save($mapped_result);
    }

    private function mapResults(array $api_result)
    {
        return (collect($api_result)->map(function ($lib) {
            return [
                'name'    => $lib['name'],
                'version' => $lib['version'],
                'data'    => json_encode($lib, JSON_THROW_ON_ERROR),
            ];
        }));
    }

    private function save($api_result)
    {
        $api_result->each(function ($lib) use($bar) {
            Library::updateOrCreate(['name' => $lib['name'], 'version' => $lib['version']], ['data' => $lib['data']]);
        });

    }
}
