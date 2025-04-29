<button {{ $attributes->merge(['type' => 'submit', 'class' => ' btn btn-error inline-flex items-center px-4 py-2  border
border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest']) }}>
    {{ $slot }}
</button>
