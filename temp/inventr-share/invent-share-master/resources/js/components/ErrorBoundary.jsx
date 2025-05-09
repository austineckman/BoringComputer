function ErrorBoundary({children}) {
    const [error, setError] = useState(null);

    if (error !== null) {
        // This is where your error UI goes
        return <h1>An error occurred: {error.message}</h1>;
    }

    // ErrorBoundary "provides" the error handler to children.
    return <ErrorBoundaryFallbackProvider onError={setError}>
        {children}
    </ErrorBoundaryFallbackProvider>;
}
