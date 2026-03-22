import React, { createContext, useContext } from 'react';
import type { LLMAdapter } from '../types/llm-adapter.js';
import type { AIFormFillerProviderProps } from './types.js';

const AIFormFillerContext = createContext<LLMAdapter | null>(null);

/**
 * Provides the LLM adapter to all `useAIFormFiller` hooks in the tree.
 *
 * @example
 * ```tsx
 * <AIFormFillerProvider adapter={new AnthropicAdapter({ apiKey })}>
 *   <MyForm />
 * </AIFormFillerProvider>
 * ```
 */
export function AIFormFillerProvider({ adapter, children }: AIFormFillerProviderProps) {
  return (
    <AIFormFillerContext.Provider value={adapter}>
      {children}
    </AIFormFillerContext.Provider>
  );
}

export function useAIFormFillerAdapter(): LLMAdapter {
  const adapter = useContext(AIFormFillerContext);
  if (!adapter) {
    throw new Error(
      'useAIFormFiller must be used inside an <AIFormFillerProvider> component'
    );
  }
  return adapter;
}
