export class PortalApiError extends Error {
  constructor(message: string, readonly status: number, readonly details: unknown, readonly body?: unknown) {
    super(message);
    this.name = 'PortalApiError';
  }
}

export function parsePortalApiError(body: unknown, status: number): PortalApiError {
  const envelope = typeof body === 'object' && body !== null && !Array.isArray(body) ? body : {};
  const message = 'message' in envelope ? envelope.message : undefined;
  const detail = 'detail' in envelope ? envelope.detail : undefined;
  const detailMessage = typeof detail === 'object' && detail !== null && 'message' in detail ? detail.message : detail;
  const details = 'details' in envelope ? envelope.details : undefined;
  const readableMessage = [message, detailMessage].find((value): value is string => typeof value === 'string' && Boolean(value.trim()));
  return new PortalApiError(readableMessage ?? `API error: ${status}`, status, details, body);
}
