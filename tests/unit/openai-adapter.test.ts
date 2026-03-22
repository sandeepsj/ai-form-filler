import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIAdapter } from '../../src/adapters/openai-adapter.js';

const mockCreate = vi.fn();

const fakeClient = {
  chat: {
    completions: {
      create: mockCreate,
    },
  },
} as never;

const baseRequest = {
  systemPrompt: 'You are a form filler.',
  userPrompt: 'Fill the form.',
  responseSchema: { type: 'object', properties: {} },
};

describe('OpenAIAdapter', () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('calls chat.completions.create with correct messages', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{"name":"Alice"}' } }],
    });

    const adapter = new OpenAIAdapter({ client: fakeClient });
    await adapter.complete(baseRequest);

    expect(mockCreate).toHaveBeenCalledOnce();
    const call = mockCreate.mock.calls[0]?.[0];
    expect(call.messages).toContainEqual(
      expect.objectContaining({ role: 'system', content: baseRequest.systemPrompt })
    );
    expect(call.messages).toContainEqual(
      expect.objectContaining({ role: 'user', content: baseRequest.userPrompt })
    );
  });

  it('parses JSON from response', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{"name":"Bob","age":30}' } }],
    });

    const adapter = new OpenAIAdapter({ client: fakeClient });
    const result = await adapter.complete(baseRequest);

    expect(result.fields).toEqual({ name: 'Bob', age: 30 });
    expect(result.rawResponse).toBe('{"name":"Bob","age":30}');
  });

  it('throws on invalid JSON', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'not json at all' } }],
    });

    const adapter = new OpenAIAdapter({ client: fakeClient });
    await expect(adapter.complete(baseRequest)).rejects.toThrow('invalid JSON');
  });

  it('uses default model gpt-4o-mini', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{}' } }],
    });

    const adapter = new OpenAIAdapter({ client: fakeClient });
    await adapter.complete(baseRequest);

    const call = mockCreate.mock.calls[0]?.[0];
    expect(call.model).toBe('gpt-4o-mini');
  });

  it('respects custom model', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{}' } }],
    });

    const adapter = new OpenAIAdapter({ client: fakeClient, model: 'gpt-4-turbo' });
    await adapter.complete(baseRequest);

    const call = mockCreate.mock.calls[0]?.[0];
    expect(call.model).toBe('gpt-4-turbo');
  });

  it('uses json_schema response format for gpt-4o models', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{}' } }],
    });

    const adapter = new OpenAIAdapter({ client: fakeClient, model: 'gpt-4o' });
    await adapter.complete(baseRequest);

    const call = mockCreate.mock.calls[0]?.[0];
    expect(call.response_format.type).toBe('json_schema');
  });

  it('uses json_object response format for non-gpt-4o models', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '{}' } }],
    });

    const adapter = new OpenAIAdapter({ client: fakeClient, model: 'gpt-3.5-turbo' });
    await adapter.complete(baseRequest);

    const call = mockCreate.mock.calls[0]?.[0];
    expect(call.response_format.type).toBe('json_object');
  });
});
