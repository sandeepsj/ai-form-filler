import type { ExtensionStorage } from '../shared/storage-keys.js';
import { STORAGE_DEFAULTS, STORAGE_KEY } from '../shared/storage-keys.js';

export async function getSettings(): Promise<ExtensionStorage> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return { ...STORAGE_DEFAULTS, ...(result[STORAGE_KEY] as Partial<ExtensionStorage> | undefined) };
}

export async function saveSettings(settings: Partial<ExtensionStorage>): Promise<void> {
  const current = await getSettings();
  await chrome.storage.local.set({ [STORAGE_KEY]: { ...current, ...settings } });
}
