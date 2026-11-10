import { describe, expect, it } from 'vitest';
import { buildSessionExpiredLoginUrl, getSafePortalReturnPath } from './login-return';

describe('getSafePortalReturnPath', () => {
  it.each(['/portal/books', '/portal/documents/doc-1?tab=files'])('accepts portal path %s', (path) => {
    expect(getSafePortalReturnPath(path)).toBe(path);
  });

  it.each(['https://evil.example/portal/x', '//evil.example/portal/', '/\\evil.example', '/portal\\..\\x', '/login', '', null, undefined])('rejects %s', (path) => {
    expect(getSafePortalReturnPath(path)).toBeUndefined();
  });
});

describe('buildSessionExpiredLoginUrl', () => {
  it('keeps the current portal location', () => {
    expect(buildSessionExpiredLoginUrl('/portal/books', '?page=2')).toBe('/login?reason=session-expired&next=%2Fportal%2Fbooks%3Fpage%3D2');
  });

  it('omits a location outside the portal', () => {
    expect(buildSessionExpiredLoginUrl('/register', '')).toBe('/login?reason=session-expired');
  });
});
