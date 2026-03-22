import type { LLMAdapter, LLMAdapterRequest, LLMAdapterResponse } from '../types/llm-adapter.js';

export interface AnthropicAdapterOptions {
  /** Pre-configured Anthropic client instance. You own its API key and base URL. */
  client: import('@anthropic-ai/sdk').default;
  /** Model to use. Default: 'claude-haiku-4-5-20251001' */
  model?: string;
  /** Max tokens for the response. Default: 2048 */
  maxTokens?: number;
}

/**
 * LLM adapter for Anthropic Claude models.
 *
 * You must provide a pre-configured `@anthropic-ai/sdk` client — API keys are NOT accepted here.
 * Configure your client server-side and pass it in, or proxy requests through your own backend.
 *
 * @example
 * ```ts
 * import Anthropic from '@anthropic-ai/sdk';
 *
 * // Configure your client however you need (proxy, custom baseURL, etc.)
 * const client = new Anthropic({ baseURL: 'https://your-backend.com/anthropic-proxy' });
 * const adapter = new AnthropicAdapter({ client });
 * ```
 */
export class AnthropicAdapter implements LLMAdapter {
  private client: import('@anthropic-ai/sdk').default;
  private model: string;
  private maxTokens: number;

  constructor(options: AnthropicAdapterOptions) {
    this.client = options.client;
    this.model = options.model ?? 'claude-haiku-4-5-20251001';
    this.maxTokens = options.maxTokens ?? 2048;
  }

  async complete(request: LLMAdapterRequest): Promise<LLMAdapterResponse> {
    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: request.systemPrompt,
      messages: [{ role: 'user', content: request.userPrompt }],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    const rawResponse = textBlock?.type === 'text' ? textBlock.text : '';

    if (!rawResponse) {
      throw new Error('Anthropic returned an empty response');
    }

    const jsonStr = extractJson(rawResponse);

    let fields: Record<string, string | number | boolean | null> = {};
    try {
      fields = JSON.parse(jsonStr);
    } catch {
      throw new Error(`Anthropic returned invalid JSON: ${rawResponse.slice(0, 200)}`);
    }

    return { fields, rawResponse };
  }
}

/** Strip markdown code fences from the response if present */
function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return trimmed;
}
