import type { ApiError } from './types';

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
}

let refreshRequest: Promise<boolean> | null = null;

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly body?: ApiError,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuthRefresh?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers: initHeaders, skipAuthRefresh = false, ...rest } = options;
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const executeRequest = () => {
    const headers = new Headers(initHeaders);
    if (body !== undefined && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return fetch(url, {
      ...rest,
      credentials: 'include',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let response = await executeRequest();

  if (
    response.status === 401 &&
    !skipAuthRefresh &&
    shouldAttemptRefresh(path)
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await executeRequest();
    }
  }

  if (!response.ok) {
    let apiError: ApiError | undefined;
    try {
      apiError = (await response.json()) as ApiError;
    } catch {
      /* non-JSON error body */
    }
    const message =
      apiError?.message ?? `Request failed with status ${response.status}`;
    throw new ApiClientError(message, response.status, apiError);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentLength = response.headers.get('content-length');
  if (contentLength === '0') {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    const textBody = await response.text();
    if (!textBody.trim()) {
      return undefined as T;
    }
    throw new ApiClientError(
      'Unexpected non-JSON response from server.',
      response.status,
    );
  }

  return (await response.json()) as T;
}

function shouldAttemptRefresh(path: string): boolean {
  return !['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'].includes(path);
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshRequest) {
    const refreshUrl = `${getApiBaseUrl()}/auth/refresh`;
    refreshRequest = fetch(refreshUrl, {
      method: 'POST',
      credentials: 'include',
    })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}
