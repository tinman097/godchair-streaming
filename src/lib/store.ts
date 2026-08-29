import { useEffect, useState } from 'react';

export interface SystemNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
}

let notifId = 0;
const listeners = new Set<(n: SystemNotification) => void>();

export function pushNotification(n: Omit<SystemNotification, 'id'>) {
  const notification = { ...n, id: ++notifId };
  listeners.forEach((l) => l(notification));
}

export function useNotifications() {
  const [items, setItems] = useState<SystemNotification[]>([]);

  useEffect(() => {
    const listener = (n: SystemNotification) => {
      setItems((prev) => [...prev, n]);
      setTimeout(() => {
        setItems((prev) => prev.filter((x) => x.id !== n.id));
      }, 5000);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return items;
}



// Mature access gate — stored in sessionStorage
const MATURE_KEY = 'godchair_mature_verified';
const MATURE_PASSCODE = 'ARISE';

export function isMatureVerified(): boolean {
  try {
    return sessionStorage.getItem(MATURE_KEY) === MATURE_PASSCODE;
  } catch {
    return false;
  }
}

export function verifyMatureAccess(passcode: string): boolean {
  if (passcode.toUpperCase() === MATURE_PASSCODE) {
    try {
      sessionStorage.setItem(MATURE_KEY, MATURE_PASSCODE);
    } catch {}
    return true;
  }
  return false;
}

export function clearMatureAccess() {
  try {
    sessionStorage.removeItem(MATURE_KEY);
  } catch {}
}

// ---- Device ID ----
const DEVICE_KEY = 'godchair_device_id';

export function getDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return `dev_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
}

// Simple hash router
export function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || '/');

  useEffect(() => {
    const handler = () => setHash(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return hash;
}

export function navigate(path: string) {
  window.location.hash = path;
  window.scrollTo(0, 0);
}

// Parse hash into route parts
export function parseRoute(hash: string): string[] {
  return hash.split('/').filter(Boolean);
}
