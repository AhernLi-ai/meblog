const DEFAULT_LOCAL_API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
const TEST_API_BASE_URL = 'http://meblog-backend:8000/api/v1';
const DEFAULT_PRODUCTION_API_BASE_URL = 'https://api.yourdomain.com/api/v1';

interface ServerApiFetchOptions extends RequestInit {
  revalidate?: number;
}

export class ServerApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ServerApiError';
    this.status = status;
  }
}

function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '');
}

function isAbsoluteHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function getServerApiBaseUrl(): string {
  const envApiBase = process.env.SERVER_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envApiBase && isAbsoluteHttpUrl(envApiBase)) {
    const normalized = trimTrailingSlash(envApiBase);
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'local') {
      // Avoid localhost -> ::1 resolution issues on Windows in server-side fetch.
      return normalized.replace('://localhost', '://127.0.0.1');
    }
    return normalized;
  }

  if (process.env.NEXT_PUBLIC_ENV === 'test') {
    return TEST_API_BASE_URL;
  }

  if (process.env.NODE_ENV === 'development') {
    return DEFAULT_LOCAL_API_BASE_URL;
  }

  return DEFAULT_PRODUCTION_API_BASE_URL;
}

export async function fetchFromServerApi<T>(
  path: string,
  { revalidate = 300, ...init }: ServerApiFetchOptions = {}
): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${getServerApiBaseUrl()}${normalizedPath}`;
  const response = await fetch(url, {
    ...init,
    next: {
      revalidate,
      ...(init as RequestInit & { next?: Record<string, unknown> }).next,
    },
  });

  if (!response.ok) {
    let responseText = '';
    try {
      responseText = (await response.text()).slice(0, 300);
    } catch {
      // Ignore body parse failures for error logging.
    }

    console.error('[server-api] request failed', {
      url,
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });

    throw new ServerApiError(
      response.status,
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as T;
}
