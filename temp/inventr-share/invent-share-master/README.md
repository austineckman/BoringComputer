<p align="center"><a href="https://inventr.io" target="_blank"><img src="https://craft-staging.inventr.io/images/inventr-logo.png" width="200" alt="Inventr Logo"></a></p>

<p align="center">
<img src="https://img.shields.io/badge/framework-laravel-orange">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
</p>

# Inventr Project Share

The Inventr project share allows creators to build and share projects based on Inventr kits. 

# Development setup
local project requirements
- ngrok account
- Laravel Herd
- DBngin 
- .env creds for WordPress OAuth2 and MailGun

# Project Login Setup

> **Note:** Login sessions will only work if you start with the NGROK URL.
IF your NGROK callback URL does not switch, run `php artisan cache:clear` and `php composer clear-complied`

> **Note:** It may be a good idea to create an OAuth Client on the staging site for each developer, this way login will not step on each other, and we can have more than one callback


## Remote Settings
- Log into staging.inventr.io
- Navigate to the OAuth Server > Clients Plugin
- Select 'Add new client' button at the top of the plugin page
- Select 'Authorization Code' Grant type
- The 'Redirect URI' is the ngrok URL defined in the next steps 

## Local Settings
In order to test project authentication and authorization locally this project requires a reverse proxy. In our case this proxy is provided by ngrok. In order to set up the proxy on your local machine the following steps must be taken. 
- Install the ngrok executable
- Install Laravel Herd, and serve the site with Herd. 
- Share your local site - out of the box Herd is configured to utilize Expose, but we can configure it using the `herd share-tool` command. Execute the `herd share-tool ngrok` to tell herd to use ngrok instead of Expose. Then, from the project directory, execute `herd share` or `ngrok http --host-header=rewrite invent-share.test:443` (When this command runs, ngrok will start a secure tunnel to the application running on invent-share.test:443 and rewrite the Host header with this value, making your local server accessible over the public internet.). This will share the current directory. Note the public URL, as you will need it in the next step.   
- Configure the .env variable for the staging environment. The client and secret id values can be found by logging into the inventr staging environment, and inspecting the SSO plugin endpoint. Note a callback URL is not set on staging. This WILL be set on production. Leaving it unset allows the client to determine the callback URL via the initial GET request.  
- Set your callback redirect URL in the .env file to {YOUR_NGROK_PROVIDED_PUBLIC_URL}/callback
- Set SESSION_DOMAIN in .env to .{YOUR_NGROK_PROVIDED_PUBLIC_URL} (Note preceding dot)
- Login to the application via your ngrok url. Login sessions will work only if you use this specific URL. You should be redirected to the staging site, which will authorize you, and redirect you back to the application. 
- Run `yarn dev` to start project locally.


# Project creation route
/project 

# Notes
- Tailwind will purge unused in templates classes. For dynamic component styling, add the classes tp the `tailwind.config.js` `safeList` setting.

## Development Partners

- **[Curious Minds Media, Inc.](https://curiousm.com.com/)**
- Contact [eric@curiousm.com](mailto:eric@curiousm.com) for help and updates



