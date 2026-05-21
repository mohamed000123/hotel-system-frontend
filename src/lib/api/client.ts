import type { ApiError } from './types';

const TOKEN_KEY = 'hotel_booking_token';

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

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
  auth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getStoredToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

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

  return (await response.json()) as T;
}
