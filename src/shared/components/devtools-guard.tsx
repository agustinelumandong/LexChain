'use client';

import { useEffect } from 'react';

export interface DevToolsGuardProps {
  readonly disableContextMenu?: boolean;
  readonly disableShortcuts?: boolean;
  readonly enableAntiDebugging?: boolean;
  readonly allowInDevelopment?: boolean;
}

const CONSOLE_WARNING_HEADER_STYLE =
  'color: #ef4444; font-size: 28px; font-weight: bold; -webkit-text-stroke: 0.5px black;';
const CONSOLE_WARNING_BODY_STYLE = 'font-size: 14px; color: #374151;';

function isInspectShortcut(event: KeyboardEvent): boolean {
  if (event.key === 'F12') {
    return true;
  }

  const isModifierActive = event.ctrlKey || event.metaKey;
  if (!isModifierActive) {
    return false;
  }

  const key = event.key.toUpperCase();

  // Ctrl+U or Cmd+U: View Page Source
  if (key === 'U') {
    return true;
  }

  // Ctrl+Shift+I/J/C or Cmd+Option+I/J/C: DevTools shortcuts
  const isSecondaryModifierActive = event.shiftKey || event.altKey;
  if (isSecondaryModifierActive && (key === 'I' || key === 'J' || key === 'C')) {
    return true;
  }

  return false;
}

function printSecurityWarning(): void {
  // eslint-disable-next-line no-console
  console.log('%cSecurity Warning', CONSOLE_WARNING_HEADER_STYLE);
  // eslint-disable-next-line no-console
  console.log(
    '%cThis console is intended for authorized debugging only. Pasting untrusted code or executing scripts here may compromise your account or expose sensitive data.',
    CONSOLE_WARNING_BODY_STYLE,
  );
}

export function DevToolsGuard({
  disableContextMenu = true,
  disableShortcuts = true,
  enableAntiDebugging = false,
  allowInDevelopment = false,
}: DevToolsGuardProps) {
  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isGuardForcedViaEnv = process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS_GUARD === 'true';
    const isGuardActive = !isDevelopment || allowInDevelopment || isGuardForcedViaEnv;

    if (!isGuardActive) {
      return;
    }

    printSecurityWarning();

    const handleContextMenu = (event: MouseEvent) => {
      if (disableContextMenu) {
        event.preventDefault();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (disableShortcuts && isInspectShortcut(event)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    let antiDebugTimer: ReturnType<typeof setInterval> | null = null;
    if (enableAntiDebugging) {
      antiDebugTimer = setInterval(() => {
        // eslint-disable-next-line no-debugger
        debugger;
      }, 1000);
    }

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      if (antiDebugTimer) {
        clearInterval(antiDebugTimer);
      }
    };
  }, [disableContextMenu, disableShortcuts, enableAntiDebugging, allowInDevelopment]);

  return null;
}
