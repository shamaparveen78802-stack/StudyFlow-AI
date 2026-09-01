const STORAGE_PREFIX = 'studypulse_';

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : defaultValue;
  } catch (error) {
    console.warn(`[Storage] Failed to parse key "${key}", falling back to default.`, error);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to save key "${key}".`, error);
    return false;
  }
}

export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.error(`[Storage] Failed to remove key "${key}".`, error);
  }
}

export function clearAllAppData(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (error) {
    console.error('[Storage] Error clearing app data', error);
  }
}

export function exportAppDataJSON(): string {
  if (typeof window === 'undefined') return '{}';
  const data: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(STORAGE_PREFIX)) {
      const cleanKey = k.replace(STORAGE_PREFIX, '');
      try {
        data[cleanKey] = JSON.parse(localStorage.getItem(k) || 'null');
      } catch {
        data[cleanKey] = localStorage.getItem(k);
      }
    }
  }
  return JSON.stringify(data, null, 2);
}

export function importAppDataJSON(jsonStr: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed !== 'object' || parsed === null) return false;
    for (const [key, val] of Object.entries(parsed)) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
    }
    return true;
  } catch (err) {
    console.error('[Storage] Invalid import JSON', err);
    return false;
  }
}
