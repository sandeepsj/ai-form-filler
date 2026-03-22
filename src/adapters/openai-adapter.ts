import type { LLMAdapter, LLMAdapterRequest, LLMAdapterResponse } from '../types/llm-adapter.js';

export interface OpenAIAdapterOptions {
  /** Pre-configured OpenAI client instance. You own its API key and base URL. */
  client: import('openai').default;
  /** Model to use. Default: 'gpt-4o-mini' */
  model?: string;
  /** Sampling temperature. Default: 0 (deterministic) */
  temperature?: number;
}

/**
 * LLM adapter for OpenAI models.
 *
 * You must provide a pre-configured `openai` client — API keys are NOT accepted here.
 * Configure your client server-side and pass it in, or proxy requests through your own backend.
 *
 * Uses structured outputs (json_schema) on gpt-4o and later models.
 * Falls back to json_object mode for older models.
 *
 * @example
 * ```ts
 * import OpenAI from 'openai';
 *
 * // Configure your client however you need (proxy, custom baseURL, etc.)
 * const client = new OpenAI({ baseURL: 'https://your-backend.com/openai-proxy' });
 * const adapter = new OpenAIAdapter({ client });
 * ```
 */
export class OpenAIAdapter implements LLMAdapter {
  private client: import('openai').default;
  private model: string;
  private temperature: number;

  constructor(options: OpenAIAdapterOptions) {
    this.client = options.client;
    this.model = options.model ?? 'gpt-4o-mini';
    this.temperature = options.temperature ?? 0;
  }

  async complete(request: LLMAdapterRequest): Promise<LLMAdapterResponse> {
    const supportsStructuredOutputs = this.model.startsWith('gpt-4o');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responseFormat: any = supportsStructuredOutputs
      ? {
          type: 'json_schema',
          json_schema: {
            name: 'form_fill_response',
            strict: true,
            schema: request.responseSchema,
          },
        }
      : { type: 'json_object' };

    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: this.temperature,
      response_format: responseFormat,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
    });

    const rawResponse = completion.choices[0]?.message?.content ?? '';

    let fields: Record<string, string | number | boolean | null> = {};
    try {
      fields = JSON.parse(rawResponse);
    } catch {
      throw new Error(`OpenAI returned invalid JSON: ${rawResponse.slice(0, 200)}`);
    }

    return { fields, rawResponse };
  }
}
