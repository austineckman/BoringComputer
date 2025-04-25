import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

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
      
      const response = await fetch(url);
      
      if (response.status === 401) {
        if (options.on401 === 'returnNull') {
          return null;
        } else {
          throw new Error('Unauthorized');
        }
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
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

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }
  
  return response;
};