import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  urlOrMethod: string,
  urlOrData?: string | unknown,
  dataOrHeaders?: unknown | Record<string, string>,
  headersParam?: Record<string, string>,
): Promise<Response> {
  // Detect if the first parameter is a URL (starts with /) or a method
  let method: string;
  let url: string;
  let data: unknown | undefined;
  let customHeaders: Record<string, string> | undefined;
  
  // First parameter is the URL (backward compatibility mode)
  if (urlOrMethod.startsWith('/')) {
    console.warn('Deprecated apiRequest usage: URL should be the second parameter, not the first');
    // If data is provided, we must use POST not GET since GET cannot have a body
    method = urlOrData ? 'POST' : 'GET'; 
    url = urlOrMethod;
    data = urlOrData;
    customHeaders = dataOrHeaders as Record<string, string> | undefined;
  } 
  // Normal usage: first parameter is the method
  else {
    method = urlOrMethod;
    url = urlOrData as string;
    data = dataOrHeaders;
    customHeaders = headersParam;
  }
  
  // GET/HEAD methods cannot have a body - if we have data, convert to POST
  if ((method === 'GET' || method === 'HEAD') && data) {
    console.warn(`Converting ${method} with body to POST request`);
    method = 'POST';
  }
  
  const requestHeaders: HeadersInit = {};
  
  // Only add Content-Type for non-FormData with data
  if (!(data instanceof FormData) && data) {
    requestHeaders["Content-Type"] = "application/json";
  }
  
  // Add any custom headers
  if (customHeaders) {
    Object.keys(customHeaders).forEach(key => {
      requestHeaders[key] = customHeaders![key];
    });
  }
  
  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: data instanceof FormData 
      ? data // Send FormData as is
      : data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
