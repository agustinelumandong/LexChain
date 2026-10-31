import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const required = [
  'E2E_BACKEND_URL',
  'E2E_DISPOSABLE_BACKEND_CONFIRM',
  'E2E_LAWYER_EMAIL',
  'E2E_LAWYER_PASSWORD',
  'E2E_PARTICIPANT_EMAIL',
  'E2E_PARTICIPANT_PASSWORD',
  'E2E_PDF_PATH',
];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  throw new Error(`Missing required E2E settings: ${missing.join(', ')}. No browser or backend request was made.`);
}

const backendUrl = new URL(process.env.E2E_BACKEND_URL);
const confirmationUrl = new URL(process.env.E2E_DISPOSABLE_BACKEND_CONFIRM);
assert.equal(backendUrl.href, confirmationUrl.href, 'Confirm the exact disposable backend URL before running this mutating journey.');
assert.ok(backendUrl.protocol === 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(backendUrl.hostname), 'The disposable backend must use HTTPS or run locally.');

await access(process.env.E2E_PDF_PATH);
const { chromium } = await import('playwright');

const portServer = createServer();
await new Promise((resolve, reject) => {
  portServer.once('error', reject);
  portServer.listen(0, '127.0.0.1', resolve);
});
const { port } = portServer.address();
await new Promise((resolve, reject) => portServer.close((error) => error ? reject(error) : resolve()));
const baseUrl = new URL(`http://127.0.0.1:${port}`);
const nextCli = createRequire(import.meta.url).resolve('next/dist/bin/next');
const server = spawn(process.execPath, [nextCli, 'dev', '--hostname', '127.0.0.1', '--port', String(port)], {
  cwd: process.cwd(),
  env: { ...process.env, API_URL: backendUrl.href, NEXT_PUBLIC_API_URL: backendUrl.href, USE_MOCK_API: 'false', NEXT_PUBLIC_USE_MOCK_API: 'false' },
  stdio: 'ignore',
  windowsHide: true,
});
let serverExit;
server.once('exit', (code) => { serverExit = code ?? 1; });
const startupDeadline = Date.now() + 60_000;
let serverReady = false;
while (Date.now() < startupDeadline && serverExit === undefined) {
  try {
    const response = await fetch(baseUrl, { signal: AbortSignal.timeout(1_000) });
    if (response.status < 500) {
      serverReady = true;
      break;
    }
  } catch {
    // Next.js is still starting; the bounded deadline keeps this wait finite.
  }
  await new Promise((resolve) => setTimeout(resolve, 250));
}
if (!serverReady) {
  server.kill();
  throw new Error(`Could not start the isolated local Next.js server (exit ${serverExit ?? 'pending'}); no live browser journey was started.`);
}

const lawyerCredentials = { email: process.env.E2E_LAWYER_EMAIL, password: process.env.E2E_LAWYER_PASSWORD };
const participantCredentials = { email: process.env.E2E_PARTICIPANT_EMAIL, password: process.env.E2E_PARTICIPANT_PASSWORD };
const documentTitle = `E2E document ${Date.now()}`;
let browser;
const contexts = [];
let stage = 'browser setup';

async function signIn(page, credentials) {
  await page.goto(new URL('/login', baseUrl).href, { waitUntil: 'domcontentloaded' });
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.waitForURL('**/portal/**', { timeout: 30_000 });
}

try {
  browser = await chromium.launch();
  const lawyerContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  contexts.push(lawyerContext);
  const lawyer = await lawyerContext.newPage();
  lawyer.setDefaultTimeout(15_000);
  lawyer.setDefaultNavigationTimeout(30_000);

  const participantContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  contexts.push(participantContext);
  const participant = await participantContext.newPage();
  participant.setDefaultTimeout(15_000);
  participant.setDefaultNavigationTimeout(30_000);

  stage = 'lawyer sign-in';
  console.log(`Running against explicitly confirmed backend host: ${backendUrl.host}`);
  await signIn(lawyer, lawyerCredentials);

  stage = 'document upload';
  await lawyer.goto(new URL('/portal/upload', baseUrl).href, { waitUntil: 'domcontentloaded' });
  await lawyer.getByRole('heading', { name: 'Upload Document' }).waitFor();
  await lawyer.getByLabel('Document title').fill(documentTitle);
  const bookPicker = lawyer.getByRole('button', { name: 'Register book' });
  await bookPicker.waitFor({ state: 'visible' });
  await bookPicker.click();
  const bookOption = lawyer.getByRole('option').filter({ hasText: /· Open$/ }).first();
  await bookOption.waitFor({ state: 'visible' });
  await bookOption.click();
  await lawyer.locator('input[type="file"]').setInputFiles(process.env.E2E_PDF_PATH);
  await lawyer.getByRole('button', { name: 'Confirm and file', exact: true }).click();
  await lawyer.waitForURL('**/portal/documents/**', { timeout: 60_000 });
  const docMatch = new URL(lawyer.url()).pathname.match(/\/portal\/documents\/([^/]+)$/);
  assert.ok(docMatch, 'Upload did not land on a document page.');
  const documentId = decodeURIComponent(docMatch[1]);

  stage = 'participant invitation';
  await lawyer.goto(new URL(`/portal/documents/${encodeURIComponent(documentId)}/participants`, baseUrl).href, { waitUntil: 'domcontentloaded' });
  const participantEmail = lawyer.getByLabel('Email');
  await participantEmail.fill(participantCredentials.email);
  await lawyer.getByRole('button', { name: 'Find account', exact: true }).click();
  await lawyer.getByRole('status').filter({ hasText: 'Account found:' }).waitFor({ state: 'visible' });
  await lawyer.getByRole('button', { name: 'Send invitation', exact: true }).click();
  await participantEmail.waitFor({ state: 'visible' });
  assert.equal(await participantEmail.inputValue(), '', 'Invitation did not complete successfully.');

  stage = 'participant sign-in';
  await signIn(participant, participantCredentials);

  stage = 'participant document visibility';
  await participant.goto(new URL('/portal/documents', baseUrl).href, { waitUntil: 'domcontentloaded' });
  await participant.getByText(documentTitle, { exact: true }).waitFor({ state: 'visible' });

  stage = 'document verification';
  await lawyer.goto(new URL(`/portal/documents/${encodeURIComponent(documentId)}`, baseUrl).href, { waitUntil: 'domcontentloaded' });
  const verificationLink = lawyer.getByRole('link', { name: 'Verify integrity', exact: true });
  await verificationLink.waitFor({ state: 'visible' });
  await verificationLink.click();
  await lawyer.waitForURL(`**/portal/documents/${encodeURIComponent(documentId)}/verify`, { timeout: 30_000 });
  await lawyer.locator('main').waitFor({ state: 'visible' });

  console.log('Legacy live journey passed: upload, invite, participant visibility, and verification page loaded.');
} catch (error) {
  console.error(`Legacy live journey failed during ${stage} (${error?.name ?? 'Error'}). Details omitted to avoid logging account data or backend responses.`);
  process.exitCode = 1;
} finally {
  await Promise.allSettled(contexts.map((context) => context.close()));
  await browser?.close();
  if (server.exitCode === null) server.kill();
}
