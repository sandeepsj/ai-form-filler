import type { FormConfig } from '../types/form-config.js';
import type { RawDataInput } from '../types/raw-data-input.js';
import type { LLMAdapter } from '../types/llm-adapter.js';
import type { FillResult, FieldFillStatus } from '../types/fill-result.js';

export interface AIFormFillerProviderProps {
  adapter: LLMAdapter;
  children: React.ReactNode;
}

export interface UseAIFormFillerOptions {
  config: FormConfig;
  formRef?: React.RefObject<HTMLFormElement | null>;
  onFillComplete?: (result: FillResult) => void;
  onFieldFilled?: (status: FieldFillStatus) => void;
  onError?: (error: Error) => void;
}

export interface UseAIFormFillerReturn {
  fill: (input: RawDataInput, hint?: string) => Promise<FillResult>;
  isLoading: boolean;
  lastResult: FillResult | null;
  error: Error | null;
  reset: () => void;
}
