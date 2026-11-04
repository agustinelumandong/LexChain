// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DevToolsGuard } from './devtools-guard';

describe('DevToolsGuard', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('prevents F12 key press', () => {
    render(<DevToolsGuard />);

    const event = new KeyboardEvent('keydown', {
      key: 'F12',
      cancelable: true,
    });
    const defaultPrevented = !window.dispatchEvent(event);

    expect(defaultPrevented).toBe(true);
  });

  it('prevents Ctrl+Shift+I shortcut', () => {
    render(<DevToolsGuard />);

    const event = new KeyboardEvent('keydown', {
      key: 'I',
      ctrlKey: true,
      shiftKey: true,
      cancelable: true,
    });
    const defaultPrevented = !window.dispatchEvent(event);

    expect(defaultPrevented).toBe(true);
  });

  it('prevents Cmd+Option+I on macOS', () => {
    render(<DevToolsGuard />);

    const event = new KeyboardEvent('keydown', {
      key: 'i',
      metaKey: true,
      altKey: true,
      cancelable: true,
    });
    const defaultPrevented = !window.dispatchEvent(event);

    expect(defaultPrevented).toBe(true);
  });

  it('prevents Ctrl+U (View Source)', () => {
    render(<DevToolsGuard />);

    const event = new KeyboardEvent('keydown', {
      key: 'u',
      ctrlKey: true,
      cancelable: true,
    });
    const defaultPrevented = !window.dispatchEvent(event);

    expect(defaultPrevented).toBe(true);
  });

  it('allows normal typing and standard shortcuts', () => {
    render(<DevToolsGuard />);

    const normalKeyEvent = new KeyboardEvent('keydown', {
      key: 'a',
      cancelable: true,
    });
    expect(window.dispatchEvent(normalKeyEvent)).toBe(true);

    const copyEvent = new KeyboardEvent('keydown', {
      key: 'c',
      ctrlKey: true,
      cancelable: true,
    });
    expect(window.dispatchEvent(copyEvent)).toBe(true);
  });

  it('prevents context menu (right click) when enabled', () => {
    render(<DevToolsGuard disableContextMenu={true} />);

    const event = new MouseEvent('contextmenu', { cancelable: true });
    const defaultPrevented = !window.dispatchEvent(event);

    expect(defaultPrevented).toBe(true);
  });

  it('allows context menu when disableContextMenu is false', () => {
    render(<DevToolsGuard disableContextMenu={false} />);

    const event = new MouseEvent('contextmenu', { cancelable: true });
    const defaultPrevented = !window.dispatchEvent(event);

    expect(defaultPrevented).toBe(false);
  });

  it('does not attach listeners in development unless allowInDevelopment is true', () => {
    vi.stubEnv('NODE_ENV', 'development');

    render(<DevToolsGuard allowInDevelopment={false} />);

    const event = new KeyboardEvent('keydown', {
      key: 'F12',
      cancelable: true,
    });
    const defaultPrevented = !window.dispatchEvent(event);

    expect(defaultPrevented).toBe(false);
  });

  it('attaches listeners in development when allowInDevelopment is true', () => {
    vi.stubEnv('NODE_ENV', 'development');

    render(<DevToolsGuard allowInDevelopment={true} />);

    const event = new KeyboardEvent('keydown', {
      key: 'F12',
      cancelable: true,
    });
    const defaultPrevented = !window.dispatchEvent(event);

    expect(defaultPrevented).toBe(true);
  });

  it('attaches listeners in development when NEXT_PUBLIC_ENABLE_DEVTOOLS_GUARD is true', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_ENABLE_DEVTOOLS_GUARD', 'true');

    render(<DevToolsGuard allowInDevelopment={false} />);

    const event = new KeyboardEvent('keydown', {
      key: 'F12',
      cancelable: true,
    });
    const defaultPrevented = !window.dispatchEvent(event);

    expect(defaultPrevented).toBe(true);
  });
});
