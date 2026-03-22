export type FillStatus =
  | 'filled'      // value was provided by LLM and input was found + set
  | 'skipped'     // LLM returned null — field left empty intentionally
  | 'not-found'   // DOM input element could not be located
  | 'error';      // unexpected error while filling this field

export interface FieldFillStatus {
  key: string;
  status: FillStatus;
  value?: string | number | boolean | null;
  error?: string;
}

export interface FillResult {
  success: boolean;
  filledCount: number;
  skippedCount: number;
  fields: FieldFillStatus[];
  /** Any error that aborted the whole autofill process */
  error?: Error;
}
