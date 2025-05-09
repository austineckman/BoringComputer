<button {{ $attributes->merge(['type' => 'submit', 'class' => 'btn inline-flex items-center px-4 py-2 btn-primary font-semibold
text-xs text-white uppercase tracking-widest']) }}>
    {{ $slot }}
</button>
