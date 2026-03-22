// Types
export type {
  FieldType,
  SelectOption,
  FieldDefinition,
  FormConfig,
} from './types/form-config.js';
export type { RawDataInput, RawDataInputEvent } from './types/raw-data-input.js';
export type { LLMAdapter, LLMAdapterRequest, LLMAdapterResponse } from './types/llm-adapter.js';
export type { FillStatus, FieldFillStatus, FillResult } from './types/fill-result.js';

// Core
export { AIFormFiller } from './core/form-filler.js';
export type { AIFormFillerOptions } from './core/form-filler.js';

// Schema utilities
export { buildJsonSchema } from './schema/json-schema-builder.js';
export { validateFormConfig } from './schema/zod-schemas.js';

// Prompt utilities
export { buildPrompt } from './prompt/prompt-builder.js';
export { SYSTEM_PROMPT } from './prompt/system-prompt.js';

// Note: React bindings are at 'ai-form-filler/react'
// Note: Svelte bindings are at 'ai-form-filler/svelte'
// Note: Adapters are at 'ai-form-filler/adapters/openai' and 'ai-form-filler/adapters/anthropic'
