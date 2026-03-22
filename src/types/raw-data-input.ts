/**
 * The raw data dump provided by the user.
 * Can be plain text, a structured object, or a File (e.g. a resume PDF/text file).
 */
export type RawDataInput = string | Record<string, unknown> | File;

export interface RawDataInputEvent {
  data: RawDataInput;
  /** Optional hint to the LLM about what type of data this is */
  hint?: string;
}
