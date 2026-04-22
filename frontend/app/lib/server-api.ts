const DEFAULT_LOCAL_API_BASE_URL = 'http://localhost:8000/api/v1';
const TEST_API_BASE_URL = 'http://meblog-backend:8000/api/v1';

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
  const envApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envApiBase && isAbsoluteHttpUrl(envApiBase)) {
    return trimTrailingSlash(envApiBase);
  }

  if (process.env.NEXT_PUBLIC_ENV === 'test') {
    return TEST_API_BASE_URL;
  }

  return DEFAULT_LOCAL_API_BASE_URL;
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
    throw new ServerApiError(
      response.status,
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as T;
}
