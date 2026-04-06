import { useState } from 'react';
import type { ExtensionStorage } from '../../shared/storage-keys.js';

interface Props {
  settings: ExtensionStorage;
  onUpdate: (partial: Partial<ExtensionStorage>) => Promise<void>;
}

export function SettingsPage({ settings, onUpdate }: Props) {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onUpdate({ apiKey, model });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}>LLM Provider</label>
        <div style={{ display: 'flex', gap: 12 }}>
          {(['openai', 'anthropic'] as const).map((p) => (
            <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <input
                type="radio"
                name="provider"
                checked={settings.provider === p}
                onChange={() => {
                  const defaultModel = p === 'openai' ? 'gpt-4o-mini' : 'claude-haiku-4-5-20251001';
                  setModel(defaultModel);
                  onUpdate({ provider: p, model: defaultModel });
                }}
              />
              {p === 'openai' ? 'OpenAI' : 'Anthropic'}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={settings.provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Model</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={inputStyle}
        />
      </div>

      <button onClick={handleSave} style={buttonStyle}>
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  fontSize: 12,
  marginBottom: 4,
  color: '#555',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: 13,
  outline: 'none',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  background: '#4285f4',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};
