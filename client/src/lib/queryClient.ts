import { QueryClient } from '@tanstack/react-query';

// CSRF token handling removed - unnecessary complexity for educational gaming platform

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

  // Add data to request body if provided
  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
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