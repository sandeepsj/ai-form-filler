import { writable } from 'svelte/store';
import { AIFormFiller } from '../core/form-filler.js';
import type { FillResult } from '../types/fill-result.js';
import type { RawDataInput } from '../types/raw-data-input.js';
import type { AIFormFillerStoreOptions, AIFormFillerStore } from './types.js';

/**
 * Creates a Svelte store-based AI form filler.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createAIFormFillerStore } from 'ai-form-filler/svelte';
 *
 *   let formEl;
 *   const { fill, loading, result } = createAIFormFillerStore({ adapter, config });
 * </script>
 *
 * <form bind:this={formEl}>
 *   <input name="name" />
 *   <button on:click={() => fill(rawData)} disabled={$loading}>Autofill</button>
 * </form>
 * ```
 */
export function createAIFormFillerStore(options: AIFormFillerStoreOptions): AIFormFillerStore {
  const loading = writable(false);
  const result = writable<FillResult | null>(null);
  const error = writable<Error | null>(null);

  const filler = new AIFormFiller({
    adapter: options.adapter,
    config: options.config,
    formElement: options.formElement,
    onFieldFilled: options.onFieldFilled,
  });

  async function fill(input: RawDataInput, hint?: string): Promise<FillResult> {
    loading.set(true);
    error.set(null);

    try {
      const fillResult = await filler.fill(input, hint);
      result.set(fillResult);

      if (!fillResult.success && fillResult.error) {
        error.set(fillResult.error);
      }

      return fillResult;
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      error.set(e);
      const failResult: FillResult = {
        success: false,
        filledCount: 0,
        skippedCount: 0,
        fields: [],
        error: e,
      };
      result.set(failResult);
      return failResult;
    } finally {
      loading.set(false);
    }
  }

  function reset(): void {
    loading.set(false);
    result.set(null);
    error.set(null);
  }

  return { fill, loading, result, error, reset };
}
