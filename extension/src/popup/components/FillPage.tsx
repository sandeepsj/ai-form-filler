import { useState } from 'react';
import type { ExtensionStorage } from '../../shared/storage-keys.js';
import type { FieldFillStatus } from '@lib/types/fill-result.js';
import type { FormConfig } from '@lib/types/form-config.js';
import { sendToContentScript, sendToBackground } from '../hooks/useMessaging.js';
import { StatusBadge } from './StatusBadge.js';

interface Props {
  settings: ExtensionStorage;
}

type FillState =
  | { step: 'idle' }
  | { step: 'detecting' }
  | { step: 'detected'; config: FormConfig }
  | { step: 'filling'; config: FormConfig }
  | { step: 'done'; results: FieldFillStatus[] }
  | { step: 'error'; message: string };

export function FillPage({ settings }: Props) {
  const [state, setState] = useState<FillState>({ step: 'idle' });

  const selectedProfiles = settings.profiles.filter((p) =>
    settings.selectedProfileIds.includes(p.id)
  );

  const canFill = settings.apiKey && selectedProfiles.length > 0;

  const handleFill = async () => {
    try {
      // Step 1: Detect fields
      setState({ step: 'detecting' });
      const detectResponse = await sendToContentScript({ type: 'DETECT_FIELDS' });

      if (detectResponse.type === 'ERROR') {
        setState({ step: 'error', message: detectResponse.error });
        return;
      }
      if (detectResponse.type !== 'FIELDS_DETECTED') return;

      const { config } = detectResponse;
      if (config.fields.length === 0) {
        setState({ step: 'error', message: 'No fillable form fields found on this page.' });
        return;
      }

      setState({ step: 'filling', config });

      // Step 2: Combine selected profiles
      const profileData = selectedProfiles.map((p) => `--- ${p.name} ---\n${p.data}`).join('\n\n');

      // Step 3: Run LLM
      const llmResponse = await sendToBackground({
        type: 'RUN_LLM',
        config,
        profileData,
        provider: settings.provider,
        apiKey: settings.apiKey,
        model: settings.model,
      });

      if (llmResponse.type === 'LLM_ERROR') {
        setState({ step: 'error', message: llmResponse.error });
        return;
      }

      // Step 4: Fill DOM
      const fillResponse = await sendToContentScript({
        type: 'FILL_DOM',
        fields: config.fields,
        values: llmResponse.values,
      });

      if (fillResponse.type === 'ERROR') {
        setState({ step: 'error', message: fillResponse.error });
        return;
      }
      if (fillResponse.type === 'FILL_COMPLETE') {
        setState({ step: 'done', results: fillResponse.results });
      }
    } catch (err) {
      setState({ step: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  };

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!settings.apiKey && (
        <div style={warningStyle}>Set your API key in Settings first.</div>
      )}
      {settings.apiKey && selectedProfiles.length === 0 && (
        <div style={warningStyle}>Add and select a data profile in Profiles first.</div>
      )}

      {selectedProfiles.length > 0 && (
        <div style={{ fontSize: 12, color: '#555' }}>
          Using: {selectedProfiles.map((p) => p.name).join(', ')}
        </div>
      )}

      <button
        onClick={handleFill}
        disabled={!canFill || state.step === 'detecting' || state.step === 'filling'}
        style={{
          ...fillBtnStyle,
          opacity: !canFill || state.step === 'detecting' || state.step === 'filling' ? 0.6 : 1,
        }}
      >
        {state.step === 'detecting' ? 'Detecting fields...' :
         state.step === 'filling' ? 'Filling with AI...' :
         'Fill This Page'}
      </button>

      {state.step === 'detected' && (
        <p style={{ fontSize: 12, color: '#555' }}>
          Found {state.config.fields.length} fields.
        </p>
      )}

      {state.step === 'error' && (
        <div style={{ ...warningStyle, background: '#fce8e6', color: '#c5221f' }}>
          {state.message}
        </div>
      )}

      {state.step === 'done' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            Filled {state.results.filter((r) => r.status === 'filled').length} / {state.results.length} fields
          </div>
          <div style={{ maxHeight: 240, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {state.results.map((r) => (
              <div
                key={r.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 8px',
                  background: '#fafafa',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              >
                <span style={{ fontFamily: 'monospace' }}>{r.key}</span>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const fillBtnStyle: React.CSSProperties = {
  padding: '12px 16px',
  background: '#4285f4',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
};

const warningStyle: React.CSSProperties = {
  padding: '10px 12px',
  background: '#fef7e0',
  color: '#b06000',
  borderRadius: 6,
  fontSize: 13,
};
