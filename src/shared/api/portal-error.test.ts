import { describe, expect, it } from 'vitest';
import { PortalApiError, parsePortalApiError } from './portal-error';

describe('parsePortalApiError', () => {
  it.each([
    [{ message: 'Backend message', detail: 'Legacy message' }, 'Backend message'],
    [{ message: ' ', detail: 'Legacy message' }, 'Legacy message'],
    [{ detail: { message: 'Legacy object message' } }, 'Legacy object message'],
    [null, 'API error: 422'],
    [undefined, 'API error: 422'],
    ['', 'API error: 422'],
    ['<html>Failure</html>', 'API error: 422'],
    [[], 'API error: 422'],
    [{ message: 4, detail: ['invalid'] }, 'API error: 422'],
    [{ message: '', detail: ' ' }, 'API error: 422'],
  ])('reads a safe message from %j', (body, message) => {
    const error = parsePortalApiError(body, 422);
    expect(error).toBeInstanceOf(PortalApiError);
    expect(error.message).toBe(message);
    expect(error.status).toBe(422);
  });

  it('retains legacy upload fields for feature-specific recovery', () => {
    const body = { code: 'DUPLICATE_FILE', detail: [{ loc: ['body', 'title'], msg: 'Required' }] };
    expect(parsePortalApiError(body, 409).body).toBe(body);
  });

  it.each([null, 'original detail', ['detail'], { reason: 'DUPLICATE_FILE', errors: [{ field: 'title', message: 'Required' }] }])('preserves original details %j', (details) => {
    expect(parsePortalApiError({ details }, 409).details).toBe(details);
  });
});
