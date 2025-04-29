import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
    ],

    safelist:[
        'bg-gray-300',
        'border-white',
        'border-0',
        'border-4',
        'hover:border-2',
        'w-24',
        'transition',
        'ease-out',
        'ease-in',
        'duration-200',
        'duration-300',
        'min-w-min',
        'right-6',
        'my-2',
        'mx-4',
        'm-1',
        'h-12',
        'm-4',
        'mr-6',
        'pr-4',
        'capitalize',
        'top-1',
        'right-1',
        'max-h-24',
        'flex-nowrap',
        'flex-none',
        'w-10',
        'justify-start',
        'content-start',
        'right-2',
        'top-2',
        'inset-1.5',
        'gap-4',
        'max-h-64',
        'max-h-72',
        'ring-red-500',
        'flex-wrap',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['quicksand', ...defaultTheme.fontFamily.sans],
                display: ['orbitron', ...defaultTheme.fontFamily.sans]
            },
        },
    },

    plugins: [forms, require("daisyui")],

    // daisyUI config (optional - here are the default values)
    daisyui: {
        themes: [{

            'inventr': {
                "primary": "#227FAB",
                "primary-content": "#FFFFFF",
                "base-200-content":"#D3DDE1",
                "secondary": "#001B2E",
                "accent": "#9E2B25",
                "base-100": "#FFFFFF",
                "base-200": "#E7EBED",
                "base-300": "#989B9D",
                "base-content": "#272727",
                "neutral": "#272727",
                "warning": "#F58F29",
                "error": "#B80C09",
                "danger": "#B80C09",
                "info": "#467FF7",
                "success": "#2C8B4B"
            }
        }],
        darkTheme: "dark", // name of one of the included themes for dark mode
        base: true, // applies background color and foreground color for root element by default
        styled: true, // include daisyUI colors and design decisions for all components
        utils: true, // adds responsive and modifier utility classes
        prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
        logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
        themeRoot: ":root", // The element that receives theme color CSS variables
    },
};
