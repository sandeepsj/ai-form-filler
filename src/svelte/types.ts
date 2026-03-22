import type { Readable } from 'svelte/store';
import type { FormConfig } from '../types/form-config.js';
import type { LLMAdapter } from '../types/llm-adapter.js';
import type { RawDataInput } from '../types/raw-data-input.js';
import type { FillResult, FieldFillStatus } from '../types/fill-result.js';

export interface AIFormFillerStoreOptions {
  adapter: LLMAdapter;
  config: FormConfig;
  formElement?: HTMLFormElement | null;
  onFieldFilled?: (status: FieldFillStatus) => void;
}

export interface AIFormFillerStore {
  fill: (input: RawDataInput, hint?: string) => Promise<FillResult>;
  loading: Readable<boolean>;
  result: Readable<FillResult | null>;
  error: Readable<Error | null>;
  reset: () => void;
}
