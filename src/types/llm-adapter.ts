export interface LLMAdapterRequest {
  systemPrompt: string;
  userPrompt: string;
  /** JSON Schema the LLM response must conform to */
  responseSchema: Record<string, unknown>;
}

export interface LLMAdapterResponse {
  /** Parsed field key → value mapping returned by the LLM */
  fields: Record<string, string | number | boolean | null>;
  /** Raw text response from the LLM, useful for debugging */
  rawResponse?: string;
}

/**
 * The central abstraction for LLM providers.
 * Implement this interface to use any LLM with ai-form-filler.
 */
export interface LLMAdapter {
  complete(request: LLMAdapterRequest): Promise<LLMAdapterResponse>;
}
