import type { RawDataInput } from '../types/raw-data-input.js';

/**
 * Converts any RawDataInput variant into a plain string for use in the LLM prompt.
 */
export async function normalizeInput(input: RawDataInput): Promise<string> {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof File) {
    return readFileAsText(input);
  }

  // Plain object
  return JSON.stringify(input, null, 2);
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file);
  });
}
