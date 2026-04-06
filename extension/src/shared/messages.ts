import type { FormConfig, FieldDefinition } from '@lib/types/form-config.js';
import type { FieldFillStatus } from '@lib/types/fill-result.js';

// Popup → Content Script
export type PopupToContentMessage =
  | { type: 'DETECT_FIELDS' }
  | { type: 'FILL_DOM'; fields: FieldDefinition[]; values: Record<string, unknown> };

// Content Script → Popup (responses)
export type ContentResponse =
  | { type: 'FIELDS_DETECTED'; config: FormConfig }
  | { type: 'FILL_COMPLETE'; results: FieldFillStatus[] }
  | { type: 'ERROR'; error: string };

// Popup → Service Worker
export interface RunLLMMessage {
  type: 'RUN_LLM';
  config: FormConfig;
  profileData: string;
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
}

// Service Worker → Popup (responses)
export type BackgroundResponse =
  | { type: 'LLM_RESULT'; values: Record<string, unknown> }
  | { type: 'LLM_ERROR'; error: string };
