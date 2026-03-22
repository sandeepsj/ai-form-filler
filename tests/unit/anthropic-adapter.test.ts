import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnthropicAdapter } from '../../src/adapters/anthropic-adapter.js';

const mockCreate = vi.fn();

const fakeClient = {
  messages: {
    create: mockCreate,
  },
} as never;

const baseRequest = {
  systemPrompt: 'You are a form filler.',
  userPrompt: 'Fill the form.',
  responseSchema: { type: 'object', properties: {} },
};

describe('AnthropicAdapter', () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it('calls messages.create with system and user content', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"name":"Alice"}' }],
    });

    const adapter = new AnthropicAdapter({ client: fakeClient });
    await adapter.complete(baseRequest);

    const call = mockCreate.mock.calls[0]?.[0];
    expect(call.system).toBe(baseRequest.systemPrompt);
    expect(call.messages).toContainEqual(
      expect.objectContaining({ role: 'user', content: baseRequest.userPrompt })
    );
  });

  it('parses JSON from text block', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{"name":"Bob","score":95}' }],
    });

    const adapter = new AnthropicAdapter({ client: fakeClient });
    const result = await adapter.complete(baseRequest);

    expect(result.fields).toEqual({ name: 'Bob', score: 95 });
  });

  it('strips markdown code fences from response', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '```json\n{"name":"Carol"}\n```' }],
    });

    const adapter = new AnthropicAdapter({ client: fakeClient });
    const result = await adapter.complete(baseRequest);

    expect(result.fields).toEqual({ name: 'Carol' });
  });

  it('strips plain code fences', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '```\n{"x":1}\n```' }],
    });

    const adapter = new AnthropicAdapter({ client: fakeClient });
    const result = await adapter.complete(baseRequest);

    expect(result.fields).toEqual({ x: 1 });
  });

  it('throws on empty response', async () => {
    mockCreate.mockResolvedValue({ content: [] });

    const adapter = new AnthropicAdapter({ client: fakeClient });
    await expect(adapter.complete(baseRequest)).rejects.toThrow('empty response');
  });

  it('throws on invalid JSON', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'not valid json' }],
    });

    const adapter = new AnthropicAdapter({ client: fakeClient });
    await expect(adapter.complete(baseRequest)).rejects.toThrow('invalid JSON');
  });

  it('uses default model claude-haiku-4-5-20251001', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{}' }],
    });

    const adapter = new AnthropicAdapter({ client: fakeClient });
    await adapter.complete(baseRequest);

    const call = mockCreate.mock.calls[0]?.[0];
    expect(call.model).toBe('claude-haiku-4-5-20251001');
  });

  it('respects custom model', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '{}' }],
    });

    const adapter = new AnthropicAdapter({ client: fakeClient, model: 'claude-opus-4-6' });
    await adapter.complete(baseRequest);

    const call = mockCreate.mock.calls[0]?.[0];
    expect(call.model).toBe('claude-opus-4-6');
  });
});
