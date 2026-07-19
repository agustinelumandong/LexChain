import { describe, expect, it } from 'vitest';
import {
  invitationExpiryDays,
  sessionTimeoutMinutes,
  uploadLimitMegabytes,
  validateOfficeSettings,
} from './office-settings-schema';

describe('office settings schema', () => {
  it('accepts the inclusive invitation expiry, upload limit, and session timeout bounds', () => {
    expect(validateOfficeSettings({
      invitationExpiryDays: invitationExpiryDays.min,
      uploadLimitMegabytes: uploadLimitMegabytes.max,
      sessionTimeoutMinutes: sessionTimeoutMinutes.min,
    })).toEqual({});
  });

  it.each([
    ['invitation expiry', { invitationExpiryDays: invitationExpiryDays.min - 1 }],
    ['upload limit', { uploadLimitMegabytes: uploadLimitMegabytes.max + 1 }],
    ['session timeout', { sessionTimeoutMinutes: sessionTimeoutMinutes.max + 1 }],
  ])('rejects an out-of-bounds %s', (_field, values) => {
    expect(validateOfficeSettings({
      invitationExpiryDays: 7,
      uploadLimitMegabytes: 25,
      sessionTimeoutMinutes: 60,
      ...values,
    })).toMatchObject({
      [Object.keys(values)[0]]: expect.any(String),
    });
  });
});
