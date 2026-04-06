import type { FormConfig } from '@lib/types/form-config.js';
import type { LLMAdapter } from '@lib/types/llm-adapter.js';
import { buildJsonSchema } from '@lib/schema/json-schema-builder.js';
import { buildPrompt } from '@lib/prompt/prompt-builder.js';
import { OpenAIFetchAdapter, AnthropicFetchAdapter } from './fetch-adapters.js';

export function createAdapter(
  provider: 'openai' | 'anthropic',
  apiKey: string,
  model: string,
): LLMAdapter {
  if (provider === 'anthropic') {
    return new AnthropicFetchAdapter(apiKey, model);
  }
  return new OpenAIFetchAdapter(apiKey, model);
}

export async function runLLMPipeline(
  config: FormConfig,
  profileData: string,
  adapter: LLMAdapter,
): Promise<Record<string, unknown>> {
  const jsonSchema = buildJsonSchema(config.fields);
  const { systemPrompt, userPrompt } = buildPrompt(config, profileData, jsonSchema);

  const response = await adapter.complete({
    systemPrompt,
    userPrompt,
    responseSchema: jsonSchema,
  });

  return response.fields;
}
