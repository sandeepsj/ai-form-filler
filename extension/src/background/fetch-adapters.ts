import type { LLMAdapter, LLMAdapterRequest, LLMAdapterResponse } from '@lib/types/llm-adapter.js';

export class OpenAIFetchAdapter implements LLMAdapter {
  constructor(
    private apiKey: string,
    private model: string = 'gpt-4o-mini',
  ) {}

  async complete(request: LLMAdapterRequest): Promise<LLMAdapterResponse> {
    const supportsStructured = this.model.startsWith('gpt-4o');

    const body: Record<string, unknown> = {
      model: this.model,
      temperature: 0,
      messages: [
        { role: 'system', content: request.systemPrompt },
        { role: 'user', content: request.userPrompt },
      ],
    };

    if (supportsStructured) {
      body.response_format = {
        type: 'json_schema',
        json_schema: {
          name: 'form_fill_response',
          strict: true,
          schema: request.responseSchema,
        },
      };
    } else {
      body.response_format = { type: 'json_object' };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };

    const rawResponse = data.choices[0]?.message?.content ?? '';
    const fields = JSON.parse(rawResponse);

    return { fields, rawResponse };
  }
}

export class AnthropicFetchAdapter implements LLMAdapter {
  constructor(
    private apiKey: string,
    private model: string = 'claude-haiku-4-5-20251001',
  ) {}

  async complete(request: LLMAdapterRequest): Promise<LLMAdapterResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4096,
        system: request.systemPrompt,
        messages: [
          { role: 'user', content: request.userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>;
    };

    const rawResponse = data.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('');

    // Strip markdown code fences if present
    const jsonStr = rawResponse.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '');
    const fields = JSON.parse(jsonStr);

    return { fields, rawResponse };
  }
}
