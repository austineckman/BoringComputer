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
  headers?: Record<string, string>,
): Promise<Response> {
  // Detect if the first parameter is a URL (starts with /) or a method
  let method: string;
  let url: string;
  let data: unknown | undefined;
  let finalHeaders: Record<string, string> | undefined;
  
  // First parameter is the URL (backward compatibility mode)
  if (urlOrMethod.startsWith('/')) {
    console.warn('Deprecated apiRequest usage: URL should be the second parameter, not the first');
    method = 'GET';
    url = urlOrMethod;
    data = urlOrData;
    finalHeaders = dataOrHeaders as Record<string, string> | undefined;
  } 
  // Normal usage: first parameter is the method
  else {
    method = urlOrMethod;
    url = urlOrData as string;
    data = dataOrHeaders;
    finalHeaders = headers;
  }
  
  // Default headers if not provided
  const defaultHeaders = data instanceof FormData 
    ? {} // Don't set Content-Type for FormData (browser will set it with boundary)
    : data ? { "Content-Type": "application/json" } : {};
  
  const requestHeaders = { ...defaultHeaders, ...finalHeaders };
  
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
