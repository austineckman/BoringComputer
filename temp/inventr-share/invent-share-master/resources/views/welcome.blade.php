<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{config('app.name','Inventr')}}</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=quicksand:400,500,600&display=swap" rel="stylesheet"/>
    <link href="https://fonts.bunny.net/css?family=orbitron:400,500,600&display=swap" rel="stylesheet"/>

    <!-- Styles -->
    @vite(['resources/css/app.css'])
</head>
<body class="antialiased bg-base-100">

{{--Navbar--}}
<livewire:layout.navigation></livewire:layout.navigation>

{{-- Social Bar --}}
<div class="flex sm:flex-row bg-white items-center justify-center px-8 pt-4">
    <div class="w-1/2 p-2 btn-ghost">
        <a class="flex items-center justify-center max-w-fit m-auto " target="_blank" href="https://www.facebook.com/groups/inventrkits/?multi_permalinks=2038872969827436&notif_id=1705884981775427&notif_t=feedback_reaction_generic&ref=notif">
            <svg class="mr-4" fill="#227FAB" width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
                <path d="M 44 22.082 C 44 9.885 34.152 0 22 0 C 9.848 0 0 9.885 0 22.082 C 0 32.433 7.107 41.128 16.689 43.517 L 16.689 28.827 L 12.152 28.827 L 12.152 22.082 L 16.689 22.082 L 16.689 19.175 C 16.689 11.662 20.075 8.177 27.431 8.177 C 28.823 8.177 31.23 8.454 32.218 8.729 L 32.218 14.836 C 31.702 14.785 30.8 14.75 29.674 14.75 C 26.065 14.75 24.672 16.122 24.672 19.684 L 24.672 22.082 L 31.857 22.082 L 30.619 28.827 L 24.664 28.827 L 24.664 44 C 35.561 42.68 44 33.373 44 22.082 Z"/>
            </svg>
            <p class="uppercase font-bold sm:text-2xl whitespace-nowrap">JOIN OUR 160,000+ MEMBER COMMUNITY</p>
        </a>
    </div>
    <div class="w-1/2 p-2 btn-ghost">
        <a class="flex items-center justify-center max-w-fit m-auto" href="{{env('FORUM_LINK')}}" target="_blank" >
            <p class="uppercase font-bold sm:text-2xl whitespace-nowrap"><span class="text-primary">Go</span> to forum</p>
            <img class="object-contain md:object-scale-down w-16 ml-2" src="{{ asset('/images/astronaut-forum.png') }}">
        </a>
    </div>
</div>


{{--    Featured Projects--}}
<livewire:welcome.featured-projects></livewire:welcome.featured-projects>

{{--    Recent Projects--}}
<div class="bg-base-200">
    <livewire:welcome.recent-projects></livewire:welcome.recent-projects>
</div>


{{--Begin Footer--}}
<footer class="footer p-10 bg-base-200 text-base-content">
    <aside>
        <img src="{{asset('/images/inventr-logo.png')}}" class="h-8">

    </aside>
    <nav class="font-bold">
        <h6 class="footer-title">Contact Us</h6>
        <p><br>InventrKits LLC<br> 8521 US Hwy 301<br> N Parrish, FL 34219<br> United States</p>
    </nav>
    <nav class="font-bold">
        <h6 class="footer-title">Quick Links</h6>
        <a href="https://inventr.io/shop" target="_blank" class="link link-hover">Products</a>
        <a href="https://inventr.io" target="_blank"  class="link link-hover">Courses</a>
        <a href="https://learn.inventr.io/resources" target="_blank"  class="link link-hover">Resources</a>
        <a href="https://coupons.inventr.io/sale" target="_blank"  class="link link-hover">Adventure kit</a>
    </nav>
    <nav class="font-bold">
        <h6 class="footer-title">Legal</h6>
        <a href="https://learn.inventr.io/terms-of-service/" target="_blank"  class="link link-hover">Terms of service</a>
        <a href="https://learn.inventr.io/privacy-policy/" target="_blank"  class="link link-hover">Privacy policy</a>
        <a href="https://learn.inventr.io/faq/" target="_blank"  class="link link-hover">FAQ</a>
    </nav>
    <nav>
        <div class="grid grid-flow-col gap-4 text-primary">
            <a href="https://github.com/inventrkits?tab=repositories" target="_blank">
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 12.222 0.753 C 10.745 0.753 9.282 1.044 7.918 1.609 C 6.553 2.174 5.313 3.003 4.269 4.047 C 2.16 6.157 0.975 9.017 0.975 12 C 0.975 16.972 4.203 21.19 8.668 22.686 C 9.23 22.775 9.41 22.427 9.41 22.123 L 9.41 20.222 C 6.295 20.897 5.631 18.715 5.631 18.715 C 5.114 17.41 4.383 17.062 4.383 17.062 C 3.359 16.364 4.461 16.387 4.461 16.387 C 5.586 16.466 6.182 17.545 6.182 17.545 C 7.161 19.255 8.814 18.749 9.455 18.479 C 9.556 17.748 9.849 17.253 10.164 16.972 C 7.667 16.691 5.046 15.723 5.046 11.438 C 5.046 10.19 5.474 9.189 6.205 8.39 C 6.092 8.109 5.699 6.939 6.317 5.421 C 6.317 5.421 7.262 5.117 9.41 6.568 C 10.299 6.321 11.266 6.197 12.222 6.197 C 13.178 6.197 14.145 6.321 15.034 6.568 C 17.182 5.117 18.127 5.421 18.127 5.421 C 18.745 6.939 18.352 8.109 18.239 8.39 C 18.97 9.189 19.398 10.19 19.398 11.438 C 19.398 15.735 16.766 16.679 14.258 16.961 C 14.663 17.309 15.034 17.995 15.034 19.041 L 15.034 22.123 C 15.034 22.427 15.214 22.787 15.787 22.686 C 20.253 21.178 23.469 16.972 23.469 12 C 23.469 10.523 23.179 9.061 22.613 7.696 C 22.048 6.332 21.22 5.092 20.175 4.047 C 19.131 3.003 17.891 2.174 16.526 1.609 C 15.162 1.044 13.699 0.753 12.222 0.753 Z" fill="#0076AD" style=""/>
                </svg>
            </a>
            <a href="https://www.youtube.com/@InventrKits" target="_blank">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="fill-current">
                    <path
                        d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                </svg>
            </a>
            <a  target="_blank" href="https://www.facebook.com/groups/inventrkits/?multi_permalinks=2038872969827436&amp;notif_id=1705884981775427&amp;notif_t=feedback_reaction_generic&amp;ref=notif">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="fill-current">
                    <path
                        d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
                </svg>
            </a>
        </div>
    </nav>
</footer>
</body>
</html>
