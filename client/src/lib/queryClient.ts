import { QueryClient } from '@tanstack/react-query';

// Store CSRF token
let csrfToken: string | null = null;

// Function to fetch a new CSRF token
async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await fetch('/api/csrf-token', {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    
    const data = await response.json();
    csrfToken = data.token;
    return csrfToken as string; // Assert that token is a string
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
}

interface RequestOptions {
  on401: 'returnNull' | 'throw';
}

export const getQueryFn = (options: RequestOptions = { on401: 'throw' }) => {
  return async ({ queryKey }: { queryKey: (string | null)[] }) => {
    const [endpoint, ...params] = queryKey;
    
    if (!endpoint) return null;
    
    try {
      const url = params.length > 0 
        ? `${endpoint}/${params.filter(Boolean).join('/')}`
        : endpoint;
      
      // Include credentials for session cookies
      const requestOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      };
      
      const response = await fetch(url, requestOptions);
      
      if (response.status === 401) {
        if (options.on401 === 'returnNull') {
          return null;
        } else {
          throw new Error('Unauthorized');
        }
      }
      
      if (!response.ok) {
        // Enhanced error handling
        let errorMessage: string;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || response.statusText;
        } catch (e) {
          // If we can't parse the response as JSON, use status text
          errorMessage = response.statusText || 'Unknown error';
        }
        throw new Error(`API error: ${errorMessage}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  };
};

export const apiRequest = async (
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  url: string,
  data?: unknown
) => {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  // For state-changing methods, include CSRF token
  if (method !== 'GET') {
    // Get current headers
    const headers = options.headers as Record<string, string>;
    
    // Fetch CSRF token if we don't have one
    if (!csrfToken) {
      try {
        await fetchCsrfToken();
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        // Continue with the request, server will return 403 if CSRF is required
      }
    }
    
    // Add CSRF token to headers if available
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    // If we're sending data, add it to the body
    if (data) {
      options.body = JSON.stringify(data);
    }
  }

  const response = await fetch(url, options);
  
  // If we get a 403 with message about CSRF token, try to refresh token and retry once
  if (response.status === 403) {
    try {
      const errorBody = await response.json();
      if (
        errorBody.error && 
        (errorBody.error.includes('CSRF token') || errorBody.error.includes('csrf'))
      ) {
        // Refresh token and retry
        await fetchCsrfToken();
        if (csrfToken) {
          // Update headers with new token
          const headers = options.headers as Record<string, string>;
          headers['X-CSRF-Token'] = csrfToken;
          
          // Retry the request
          const retryResponse = await fetch(url, options);
          return retryResponse;
        }
      }
    } catch (e) {
      // If we can't parse the response as JSON, just continue with the original response
    }
  }
  
  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.error || errorBody.message || response.statusText;
    } catch (e) {
      // If we can't parse the response as JSON, use text or status
      try {
        errorMessage = await response.text();
      } catch (e2) {
        errorMessage = response.statusText;
      }
    }
    throw new Error(errorMessage);
  }
  
  return response;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      queryFn: getQueryFn(),
    },
  },
});