const storageKey = "lexchain:next-navigation-toast";

export function queueNextNavigationToast(message: string) {
  try {
    sessionStorage.setItem(storageKey, message);
  } catch {
    // A restricted browser session can still complete the action without a queued toast.
  }
}

export function consumeNextNavigationToast() {
  try {
    const message = sessionStorage.getItem(storageKey);
    sessionStorage.removeItem(storageKey);
    return message;
  } catch {
    return null;
  }
}
