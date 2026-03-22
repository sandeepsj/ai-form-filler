import { describe, it, expect, vi } from 'vitest';
import { normalizeInput } from '../../src/core/data-normalizer.js';

describe('normalizeInput', () => {
  it('returns strings as-is', async () => {
    const result = await normalizeInput('hello world');
    expect(result).toBe('hello world');
  });

  it('JSON-stringifies plain objects', async () => {
    const input = { name: 'Jane', age: 30 };
    const result = await normalizeInput(input);
    expect(result).toBe(JSON.stringify(input, null, 2));
  });

  it('reads File contents as text', async () => {
    // Mock FileReader
    const mockReadAsText = vi.fn();
    const mockFileReader = {
      readAsText: mockReadAsText,
      onload: null as ((event: unknown) => void) | null,
      onerror: null as (() => void) | null,
      result: 'file text content',
    };

    vi.stubGlobal('FileReader', vi.fn(() => mockFileReader));

    const file = new File(['file text content'], 'test.txt', { type: 'text/plain' });

    const promise = normalizeInput(file);

    // Simulate FileReader completing
    mockReadAsText.mockImplementation(() => {
      if (mockFileReader.onload) {
        mockFileReader.onload({});
      }
    });

    // Re-trigger since the FileReader was already called
    mockFileReader.result = 'file text content';
    if (mockFileReader.onload) {
      mockFileReader.onload({});
    }

    const result = await promise;
    expect(result).toBe('file text content');

    vi.unstubAllGlobals();
  });

  it('handles nested objects', async () => {
    const input = { user: { name: 'John', skills: ['ts', 'react'] } };
    const result = await normalizeInput(input);
    expect(result).toContain('"name": "John"');
    expect(result).toContain('"ts"');
  });
});
