import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../../src/prompt/prompt-builder.js';
import { simpleContactConfig } from '../fixtures/sample-form-config.js';

describe('buildPrompt', () => {
  const schema = { type: 'object', properties: {} };

  it('includes form title in user prompt', () => {
    const { userPrompt } = buildPrompt(simpleContactConfig, 'raw data', schema);
    expect(userPrompt).toContain('Contact Form');
  });

  it('includes all field keys', () => {
    const { userPrompt } = buildPrompt(simpleContactConfig, 'raw data', schema);
    expect(userPrompt).toContain('name');
    expect(userPrompt).toContain('email');
    expect(userPrompt).toContain('message');
  });

  it('includes the raw data', () => {
    const { userPrompt } = buildPrompt(simpleContactConfig, 'John Doe john@test.com', schema);
    expect(userPrompt).toContain('John Doe john@test.com');
  });

  it('includes the JSON schema', () => {
    const { userPrompt } = buildPrompt(simpleContactConfig, 'data', schema);
    expect(userPrompt).toContain('"type": "object"');
  });

  it('returns a non-empty system prompt', () => {
    const { systemPrompt } = buildPrompt(simpleContactConfig, 'data', schema);
    expect(systemPrompt.length).toBeGreaterThan(0);
    expect(systemPrompt).toContain('form-filling');
  });

  it('includes field options when present', () => {
    const config = {
      title: 'Form',
      fields: [
        {
          key: 'size',
          label: 'Size',
          type: 'select' as const,
          options: [
            { value: 'sm', label: 'Small' },
            { value: 'lg', label: 'Large' },
          ],
        },
      ],
    };
    const { userPrompt } = buildPrompt(config, 'data', schema);
    expect(userPrompt).toContain('"sm"');
    expect(userPrompt).toContain('"lg"');
  });

  it('includes form description when present', () => {
    const config = {
      title: 'Form',
      description: 'A test form description',
      fields: [{ key: 'x', label: 'X', type: 'text' as const }],
    };
    const { userPrompt } = buildPrompt(config, 'data', schema);
    expect(userPrompt).toContain('A test form description');
  });
});
