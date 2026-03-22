import { describe, it, expect, vi } from 'vitest';
import { AIFormFiller } from '../../src/core/form-filler.js';
import type { LLMAdapter } from '../../src/types/llm-adapter.js';
import { jobApplicationConfig, simpleContactConfig } from '../fixtures/sample-form-config.js';

function makeMockAdapter(fields: Record<string, unknown>): LLMAdapter {
  return {
    complete: vi.fn().mockResolvedValue({ fields }),
  };
}

describe('AIFormFiller', () => {
  it('throws on invalid FormConfig', () => {
    expect(
      () =>
        new AIFormFiller({
          adapter: makeMockAdapter({}),
          config: { title: '', fields: [] },
        })
    ).toThrow('Invalid FormConfig');
  });

  it('returns success FillResult', async () => {
    document.body.innerHTML = `
      <form id="form">
        <input name="name" type="text" />
        <input name="email" type="email" />
        <textarea name="message"></textarea>
      </form>
    `;
    const form = document.getElementById('form') as HTMLFormElement;
    const adapter = makeMockAdapter({
      name: 'Alice',
      email: 'alice@example.com',
      message: 'Hello!',
    });

    const filler = new AIFormFiller({
      adapter,
      config: simpleContactConfig,
      formElement: form,
    });

    const result = await filler.fill('Alice, alice@example.com');

    expect(result.success).toBe(true);
    expect(result.filledCount).toBe(3);
    expect(result.skippedCount).toBe(0);
    expect(form.querySelector<HTMLInputElement>('[name="name"]')?.value).toBe('Alice');
  });

  it('counts skipped fields correctly', async () => {
    document.body.innerHTML = `
      <form id="form">
        <input name="name" type="text" />
        <input name="email" type="email" />
      </form>
    `;
    const form = document.getElementById('form') as HTMLFormElement;
    const adapter = makeMockAdapter({ name: 'Bob', email: null });

    const filler = new AIFormFiller({
      adapter,
      config: simpleContactConfig,
      formElement: form,
    });

    const result = await filler.fill('Bob');

    expect(result.filledCount).toBe(1);
    expect(result.skippedCount).toBeGreaterThanOrEqual(1);
  });

  it('returns error result when adapter throws', async () => {
    const adapter: LLMAdapter = {
      complete: vi.fn().mockRejectedValue(new Error('LLM API error')),
    };

    const filler = new AIFormFiller({ adapter, config: simpleContactConfig });
    const result = await filler.fill('data');

    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('LLM API error');
  });

  it('calls onFieldFilled callback', async () => {
    document.body.innerHTML = `
      <form id="form">
        <input name="name" type="text" />
      </form>
    `;
    const form = document.getElementById('form') as HTMLFormElement;
    const adapter = makeMockAdapter({ name: 'Charlie' });
    const onFieldFilled = vi.fn();

    const filler = new AIFormFiller({
      adapter,
      config: { title: 'Form', fields: [{ key: 'name', label: 'Name', type: 'text' }] },
      formElement: form,
      onFieldFilled,
    });

    await filler.fill('Charlie');

    expect(onFieldFilled).toHaveBeenCalledOnce();
    expect(onFieldFilled).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'name', status: 'filled' })
    );
  });

  it('passes hint to data normalizer', async () => {
    const adapter = makeMockAdapter({ name: null });
    const filler = new AIFormFiller({ adapter, config: simpleContactConfig });

    await filler.fill('data', 'resume text');

    const callArg = (adapter.complete as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(callArg?.userPrompt).toContain('resume text');
  });

  it('updateConfig changes the form config', () => {
    const filler = new AIFormFiller({
      adapter: makeMockAdapter({}),
      config: simpleContactConfig,
    });

    expect(() =>
      filler.updateConfig({
        title: 'Updated Form',
        fields: [{ key: 'phone', label: 'Phone', type: 'tel' }],
      })
    ).not.toThrow();
  });
});
