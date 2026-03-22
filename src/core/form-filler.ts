import type { FormConfig } from '../types/form-config.js';
import type { RawDataInput } from '../types/raw-data-input.js';
import type { LLMAdapter } from '../types/llm-adapter.js';
import type { FillResult, FieldFillStatus } from '../types/fill-result.js';
import { validateFormConfig } from '../schema/zod-schemas.js';
import { buildJsonSchema } from '../schema/json-schema-builder.js';
import { buildPrompt } from '../prompt/prompt-builder.js';
import { normalizeInput } from './data-normalizer.js';
import { fillDom } from './dom-filler.js';

export interface AIFormFillerOptions {
  /** The LLM adapter to use for generating field values */
  adapter: LLMAdapter;
  /** Form configuration describing all fields */
  config: FormConfig;
  /** Optionally scope DOM queries to a specific form element */
  formElement?: HTMLFormElement | null;
  /** Called after each individual field is processed */
  onFieldFilled?: (status: FieldFillStatus) => void;
}

/**
 * The main orchestrator class.
 *
 * @example
 * ```ts
 * const filler = new AIFormFiller({ adapter, config });
 * const result = await filler.fill("John Doe, john@example.com, senior engineer");
 * console.log(result.filledCount); // 3
 * ```
 */
export class AIFormFiller {
  private adapter: LLMAdapter;
  private config: FormConfig;
  private formElement?: HTMLFormElement | null;
  private onFieldFilled?: (status: FieldFillStatus) => void;

  constructor(options: AIFormFillerOptions) {
    const validation = validateFormConfig(options.config);
    if (!validation.success) {
      throw new Error(
        `Invalid FormConfig: ${validation.error.errors.map((e) => e.message).join(', ')}`
      );
    }

    this.adapter = options.adapter;
    this.config = options.config;
    this.formElement = options.formElement;
    this.onFieldFilled = options.onFieldFilled;
  }

  /**
   * Autofills the form using the provided raw data.
   * @param input - Raw data dump (string, object, or File)
   * @param hint - Optional hint describing the data format
   */
  async fill(input: RawDataInput, hint?: string): Promise<FillResult> {
    try {
      // Step 1: Normalize raw data to string
      const normalizedData = await normalizeInput(input);
      const dataWithHint = hint ? `[Data type hint: ${hint}]\n\n${normalizedData}` : normalizedData;

      // Step 2: Build JSON Schema for the form fields
      const jsonSchema = buildJsonSchema(this.config.fields);

      // Step 3: Build prompts
      const { systemPrompt, userPrompt } = buildPrompt(this.config, dataWithHint, jsonSchema);

      // Step 4: Call LLM adapter
      const adapterResponse = await this.adapter.complete({
        systemPrompt,
        userPrompt,
        responseSchema: jsonSchema,
      });

      // Step 5: Fill DOM inputs
      const fieldStatuses = fillDom(
        this.config.fields,
        adapterResponse.fields,
        this.formElement
      );

      // Notify per-field callbacks
      if (this.onFieldFilled) {
        for (const status of fieldStatuses) {
          this.onFieldFilled(status);
        }
      }

      const filledCount = fieldStatuses.filter((s) => s.status === 'filled').length;
      const skippedCount = fieldStatuses.filter((s) => s.status === 'skipped').length;

      return {
        success: true,
        filledCount,
        skippedCount,
        fields: fieldStatuses,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        filledCount: 0,
        skippedCount: 0,
        fields: [],
        error: err,
      };
    }
  }

  /** Update the form config after construction */
  updateConfig(config: FormConfig): void {
    const validation = validateFormConfig(config);
    if (!validation.success) {
      throw new Error(
        `Invalid FormConfig: ${validation.error.errors.map((e) => e.message).join(', ')}`
      );
    }
    this.config = config;
  }

  /** Update the form element scope */
  updateFormElement(formElement: HTMLFormElement | null): void {
    this.formElement = formElement;
  }
}
