import { requireApiUrl } from '@/shared/config';
import { authTokenStorage } from '@/shared/utils/secure-storage';

type RequestOptions = RequestInit & {
  auth?: boolean;
};

const API_BASE_URL = requireApiUrl().replace(/\/$/, '');

function buildUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function isFormDataBody(body: RequestInit['body']) {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

async function parseResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = options.auth === false ? null : await authTokenStorage.get();
  const headers = new Headers(options.headers);

  if (!isFormDataBody(options.body) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...options,
      headers,
    });
  } catch (error) {
    throw {
      request: true,
      message: error instanceof Error ? error.message : 'Network request failed',
    };
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    throw {
      response: {
        status: response.status,
        data,
      },
    };
  }

  return data as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body:
        body === undefined || isFormDataBody(body as RequestInit['body'])
          ? (body as RequestInit['body'])
          : JSON.stringify(body),
    }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
