import type { SignInResponse, SignUpResponse, MessageResponse } from '@/services/api/auth.api';

export const MOCK_SIGN_IN_RESPONSE: SignInResponse = {
  access_token:
    'eyJhbGciOiJFUzI1NiIsImtpZCI6IjFmZjdjNGQ2LTliYzYtNGRkMC1hNzQ1LWFmNGUzZWMwZjUxYiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2JsaGVoc29lc3d3c3lpZ2pva2J3LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI1NTdlZmQyNi0wMTQwLTRmMzItYTY3My0zMDczZmZmMzZhZWEiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc4MjY1OTAxLCJpYXQiOjE3NzgyNjIzMDEsImVtYWlsIjoiZGlib3BpdzQzOEBpbWFzaHIuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImRpYm9waXc0MzhAaW1hc2hyLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjU1N2VmZDI2LTAxNDAtNGYzMi1hNjczLTMwNzNmZmYzNmFlYSJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzc4MjYyMzAxfV0sInNlc3Npb25faWQiOiJkMzI4YjRlZi0yZDUzLTQzOTQtOGNmNC1mZjFmODZjMTQ4NGIiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.3HKrUxOqd5B4KopRRRtwYAEQCvNxrvJW30ykNDU0LbbbXZS4SXlHlhdX_ad1lMhLTJXGKdbSA1aLOudWWtao4w',
  refresh_token: 'bh3xqvjrm5pm',
  token_type: 'bearer',
  expires_in: 3600,
  user: {
    id: 'da976baa-007f-4f37-a551-f6c4e279c461',
    email: 'dibopiw438@imashr.com',
  },
};

export const MOCK_SIGN_UP_RESPONSE: SignUpResponse = {
  message: 'Account created successfully. Please check your email to verify your account.',
  user_id: '557efd26-0140-4f32-a673-3073fff36aea',
  email: 'dibopiw438@imashr.com',
  requires_email_confirmation: true,
};

export const MOCK_RESEND_VERIFICATION_RESPONSE: MessageResponse = {
  message: 'Verification email sent. Please check your inbox.',
};

export const MOCK_VERIFICATION_EMAIL_SENT: MessageResponse = {
  message: 'Verification email sent. Please check your inbox.',
};