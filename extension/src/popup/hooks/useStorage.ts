import { useState, useEffect, useCallback } from 'react';
import type { ExtensionStorage } from '../../shared/storage-keys.js';
import { getSettings, saveSettings } from '../storage.js';

export function useStorage() {
  const [settings, setSettings] = useState<ExtensionStorage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const update = useCallback(async (partial: Partial<ExtensionStorage>) => {
    await saveSettings(partial);
    const updated = await getSettings();
    setSettings(updated);
  }, []);

  return { settings, loading, update };
}
