// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CategoriesPage from './categories-page';

type CategoryFixture = { id: string; name: string; active: boolean };
type ApiCall = { path: string; method: string; body: string | undefined };

let categories: CategoryFixture[];
let role: string;
let failedCategoryReads: number;
let holdCategoryReads: boolean;
let failCategoryWrites: boolean;
let holdCategoryWrites: boolean;
let releaseCategoryRead: (() => void) | undefined;
let releaseCategoryWrite: (() => void) | undefined;
let calls: ApiCall[];
let nextId: number;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function requestPath(url: URL) {
  return url.searchParams.get('path') ?? '';
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <CategoriesPage />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  categories = [
    { id: 'category-1', name: 'Contracts', active: true },
    { id: 'category-2', name: 'Certificates', active: true },
  ];
  role = 'lawyer';
  failedCategoryReads = 0;
  holdCategoryReads = false;
  failCategoryWrites = false;
  holdCategoryWrites = false;
  releaseCategoryRead = undefined;
  releaseCategoryWrite = undefined;
  calls = [];
  nextId = 3;

  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://localhost');
    const method = init?.method ?? 'GET';
    const path = requestPath(url);
    calls.push({ path, method, body: typeof init?.body === 'string' ? init.body : undefined });

    if (url.pathname === '/api/portal/proxy' && path === '/users/') {
      return jsonResponse({ role });
    }
    if (url.pathname === '/api/portal/proxy' && path === '/categories/') {
      if (failedCategoryReads > 0) {
        failedCategoryReads -= 1;
        return jsonResponse({ message: 'Category service unavailable' }, 503);
      }
      if (holdCategoryReads) {
        return new Promise<Response>((resolve) => {
          releaseCategoryRead = () => resolve(jsonResponse(categories));
        });
      }
      return jsonResponse(categories);
    }
    if (url.pathname === '/api/portal/proxy-post' && path.startsWith('/categories/')) {
      if (failCategoryWrites) return jsonResponse({ message: 'Save failed' }, 500);

      const payload = typeof init?.body === 'string' ? JSON.parse(init.body) as { name: string } : undefined;
      const create = () => {
        const category = { id: `category-${nextId++}`, name: payload?.name ?? '', active: true };
        categories.push(category);
        return category;
      };
      const update = () => {
        const category = categories.find((item) => path === `/categories/${item.id}`);
        if (!category) return undefined;
        category.name = payload?.name ?? category.name;
        return category;
      };
      const deactivate = () => {
        const category = categories.find((item) => path === `/categories/${item.id}/deactivate`);
        if (!category) return undefined;
        category.active = false;
        return category;
      };

      const operation = method === 'POST' && path === '/categories/'
        ? create
        : method === 'PATCH'
          ? update
          : method === 'POST'
            ? deactivate
            : undefined;
      const changed = operation?.();
      if (!changed) return jsonResponse({ message: 'Category not found' }, 404);
      const status = method === 'POST' && path === '/categories/' ? 201 : 200;
      if (holdCategoryWrites) {
        return new Promise<Response>((resolve) => {
          releaseCategoryWrite = () => resolve(jsonResponse(changed, status));
        });
      }
      return jsonResponse(changed, status);
    }
    return jsonResponse({ message: 'Unexpected request' }, 404);
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('category management', () => {
  it('loads the authenticated lawyer’s saved categories', async () => {
    renderPage();

    expect(await screen.findByText('Contracts')).toBeTruthy();
    expect(screen.getByText('Certificates')).toBeTruthy();
    expect(screen.queryByText(/Demo data/)).toBeNull();
    expect(calls).toContainEqual({ path: '/categories/', method: 'GET', body: undefined });
  });

  it('shows loading feedback while the directory request is pending', async () => {
    holdCategoryReads = true;
    renderPage();

    expect(await screen.findByText('Loading categories…')).toBeTruthy();
    await act(async () => {
      holdCategoryReads = false;
      releaseCategoryRead?.();
    });
    expect(await screen.findByText('Contracts')).toBeTruthy();
  });

  it('shows an empty state and allows the first category to be created', async () => {
    categories = [];
    renderPage();

    expect(await screen.findByRole('heading', { name: 'No categories yet' })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Create first category' }));
    expect(screen.getByRole('dialog', { name: 'Create Category' })).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Category name'));
  });

  it('creates, renames, and deactivates through the same-origin API', async () => {
    renderPage();
    await screen.findByText('Contracts');

    fireEvent.click(screen.getByRole('button', { name: 'Create Category' }));
    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: 'Affidavits' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Category' }));
    expect(await screen.findByText('Affidavits')).toBeTruthy();
    expect(calls).toContainEqual({
      path: '/categories/',
      method: 'POST',
      body: JSON.stringify({ name: 'Affidavits' }),
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit Affidavits' }));
    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: 'Sworn Affidavits' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(await screen.findByText('Sworn Affidavits')).toBeTruthy();
    expect(calls.some((call) => call.method === 'PATCH' && call.path.startsWith('/categories/category-'))).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Deactivate Sworn Affidavits' }));
    const dialog = screen.getByRole('dialog', { name: 'Deactivate Sworn Affidavits?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Deactivate category' }));
    await waitFor(() => {
      const row = screen.getByText('Sworn Affidavits').closest('li');
      expect(row && within(row).getByText('Inactive')).toBeTruthy();
    });
    expect(calls.some((call) => call.method === 'POST' && call.path.endsWith('/deactivate'))).toBe(true);
  });

  it('shows pending state and prevents a duplicate save', async () => {
    holdCategoryWrites = true;
    renderPage();
    await screen.findByText('Contracts');

    fireEvent.click(screen.getByRole('button', { name: 'Create Category' }));
    fireEvent.change(screen.getByLabelText('Category name'), { target: { value: 'Affidavits' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Category' }));

    const pending = await screen.findByRole('button', { name: 'Saving…' });
    expect((pending as HTMLButtonElement).disabled).toBe(true);
    expect(calls.filter((call) => call.method === 'POST' && call.path === '/categories/')).toHaveLength(1);

    await act(async () => {
      holdCategoryWrites = false;
      releaseCategoryWrite?.();
    });
    expect(await screen.findByText('Affidavits')).toBeTruthy();
  });

  it('keeps the draft and authoritative list when a save fails', async () => {
    failCategoryWrites = true;
    renderPage();
    await screen.findByText('Contracts');

    fireEvent.click(screen.getByRole('button', { name: 'Create Category' }));
    const input = screen.getByLabelText('Category name') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Affidavits' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Category' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Save failed');
    expect(input.value).toBe('Affidavits');
    expect(screen.getByText('Contracts')).toBeTruthy();
    expect(screen.queryByText('Affidavits')).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Create Category' })).toBeTruthy();
  });

  it('keeps a category active and the confirmation open when deactivation fails', async () => {
    renderPage();
    await screen.findByText('Contracts');
    failCategoryWrites = true;

    fireEvent.click(screen.getByRole('button', { name: 'Deactivate Contracts' }));
    const dialog = screen.getByRole('dialog', { name: 'Deactivate Contracts?' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Deactivate category' }));

    expect((await within(dialog).findByRole('alert')).textContent).toContain('Save failed');
    const row = screen.getByText('Contracts').closest('li');
    expect(row && within(row).getByText('Active')).toBeTruthy();
    expect(screen.getByRole('dialog', { name: 'Deactivate Contracts?' })).toBeTruthy();
  });

  it('lets the lawyer retry a failed category load', async () => {
    failedCategoryReads = 1;
    renderPage();

    expect(await screen.findByText('Unable to load categories')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Contracts')).toBeTruthy();
  });

  it('does not request categories for a participant account', async () => {
    role = 'user';
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Categories are restricted' })).toBeTruthy();
    expect(calls.some((call) => call.path === '/categories/')).toBe(false);
  });
});
