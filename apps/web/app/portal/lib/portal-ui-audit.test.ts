// @vitest-environment jsdom
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { createElement } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from "vitest";
import ProfilePage from '../profile/page';
import PortalChatbot from '../components/portal-chatbot';

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { f_name: 'Ada', l_name: 'Lovelace', email: 'ada@example.com', role: 'document_issuer' }, isLoading: false }),
}));

vi.mock('next/link', () => ({ default: ({ href, children, ...props }: React.ComponentProps<'a'>) => createElement('a', { href, ...props }, children) }));

afterEach(cleanup);

const appDirectory = path.resolve(process.cwd(), "app");

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(entryPath);
    return entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") ? [entryPath] : [];
  }));

  return nested.flat();
}

describe("portal UI source audit", () => {
  it("keeps rendered admin product copy neutral", async () => {
    const adminSources = await Promise.all((await sourceFiles(path.join(appDirectory, "admin"))).map((file) => readFile(file, "utf8")));

    expect(adminSources.join("\n")).not.toMatch(/super admin|developer dashboard|platform administration/i);
  });

  it("names the notification and uploaded-file removal controls", async () => {
    const [dashboard, upload] = await Promise.all([
      readFile(path.join(appDirectory, "portal/dashboard/page.tsx"), "utf8"),
      readFile(path.join(appDirectory, "portal/upload/page.tsx"), "utf8"),
    ]);

    expect(dashboard).toContain('aria-label="View notifications"');
    expect(upload).toContain('aria-label="Remove uploaded file"');
  });

  it("provides a keyboard-reachable PDF chooser", async () => {
    const upload = await readFile(path.join(appDirectory, "portal/upload/page.tsx"), "utf8");

    const chooser = upload.match(/<button[\s\S]*?Choose a PDF[\s\S]*?<\/button>/)?.[0];

    expect(chooser).toContain('type="button"');
    expect(chooser).toContain('onClick={() => inputRef.current?.click()}');
  });

  it('links profile support to the support mailbox', () => {
    render(createElement(ProfilePage));

    expect(screen.getByRole('link', { name: /help and support/i }).getAttribute('href')).toBe('mailto:support@lexchain.app');
  });

  it('offers safe document-assistant guidance', () => {
    render(createElement(PortalChatbot));
    fireEvent.click(screen.getByRole('button', { name: 'Open document assistant' }));

    expect(screen.getByText('Suggested questions')).toBeTruthy();
    expect(screen.getByText('AI-generated assistance. Review the original PDF before relying on an answer.')).toBeTruthy();
  });
});
