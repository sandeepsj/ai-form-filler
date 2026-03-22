import { useState, useRef, useCallback } from 'react';
import { AIFormFiller } from '../core/form-filler.js';
import { useAIFormFillerAdapter } from './context.js';
import type { RawDataInput } from '../types/raw-data-input.js';
import type { FillResult } from '../types/fill-result.js';
import type { UseAIFormFillerOptions, UseAIFormFillerReturn } from './types.js';

/**
 * Hook that attaches AI autofill to a form.
 * Must be used inside an <AIFormFillerProvider>.
 *
 * @example
 * ```tsx
 * const formRef = useRef<HTMLFormElement>(null);
 * const { fill, isLoading } = useAIFormFiller({ config, formRef });
 *
 * return (
 *   <form ref={formRef}>
 *     <input name="name" />
 *     <button type="button" onClick={() => fill(rawData)}>
 *       {isLoading ? 'Filling...' : 'Autofill'}
 *     </button>
 *   </form>
 * );
 * ```
 */
export function useAIFormFiller(options: UseAIFormFillerOptions): UseAIFormFillerReturn {
  const adapter = useAIFormFillerAdapter();
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<FillResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Keep a stable ref to options to avoid recreating the filler on every render
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const fill = useCallback(
    async (input: RawDataInput, hint?: string): Promise<FillResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const filler = new AIFormFiller({
          adapter,
          config: optionsRef.current.config,
          formElement: optionsRef.current.formRef?.current ?? null,
          onFieldFilled: optionsRef.current.onFieldFilled,
        });

        const result = await filler.fill(input, hint);
        setLastResult(result);
        optionsRef.current.onFillComplete?.(result);

        if (!result.success && result.error) {
          setError(result.error);
          optionsRef.current.onError?.(result.error);
        }

        return result;
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        optionsRef.current.onError?.(e);
        const failResult: FillResult = {
          success: false,
          filledCount: 0,
          skippedCount: 0,
          fields: [],
          error: e,
        };
        setLastResult(failResult);
        return failResult;
      } finally {
        setIsLoading(false);
      }
    },
    [adapter]
  );

  const reset = useCallback(() => {
    setLastResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { fill, isLoading, lastResult, error, reset };
}
