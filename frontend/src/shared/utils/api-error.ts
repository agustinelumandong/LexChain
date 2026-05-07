export type AppErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR'
  | 'INTERNAL_SERVER_ERROR';

export type AppError = {
  code: AppErrorCode;
  message: string;
  status?: number;
};

type ApiErrorResponse = {
  error?: {
    code?: string;
    message?: string;
  } | string;
  message?: string;
  detail?: string | { msg?: string; message?: string }[];
};

type ErrorWithResponse = {
  response?: {
    status?: number;
    data?: ApiErrorResponse;
  };
  request?: unknown;
  message?: string;
};

function isErrorWithResponse(error: unknown): error is ErrorWithResponse {
  return typeof error === 'object' && error !== null;
}

function getCodeFromStatus(status?: number): AppErrorCode {
  if (status === undefined) return 'UNKNOWN_ERROR';
  switch (status) {
    case 401: return 'UNAUTHORIZED';
    case 403: return 'FORBIDDEN';
    case 404: return 'NOT_FOUND';
    case 422: return 'VALIDATION_ERROR';
    case 500: return 'INTERNAL_SERVER_ERROR';
    default:  return 'UNKNOWN_ERROR';
  }
}

export function parseApiError(error: unknown): AppError {
  if (!isErrorWithResponse(error)) {
    return {
      code: 'UNKNOWN_ERROR',
      message: 'Something went wrong. Please try again.',
    };
  }
  const status = error.response?.status;
  const data = error.response?.data;

  if (error.request && !error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network error. Please check your connection.',
    };
  }

  return {
    code: getCodeFromStatus(status),
    message:
      (typeof data?.error === 'string' ? data.error : data?.error?.message) ??
      data?.message ??
      (typeof data?.detail === 'string'
        ? data.detail
        : data?.detail?.[0]?.msg ?? data?.detail?.[0]?.message) ??
      error.message ??
      'Something went wrong. Please try again.',
    status,
  };

}
