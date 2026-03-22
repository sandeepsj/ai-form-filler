export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox';

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDefinition {
  /** Unique key — should match the HTML input's `name` or `id` attribute */
  key: string;
  /** Human-readable label shown to the LLM */
  label: string;
  /** Detailed description to help the LLM understand what value to extract */
  description?: string;
  /** HTML input type */
  type: FieldType;
  /** Available choices — required for `select` and `radio` types */
  options?: SelectOption[];
  /** Whether this field must be filled */
  required?: boolean;
  /** Optional CSS selector override; falls back to [name="key"] or #key */
  selector?: string;
}

export interface FormConfig {
  /** Readable title of the form, e.g. "Job Application Form" */
  title: string;
  /** Optional description of the form's purpose to give the LLM more context */
  description?: string;
  /** All fields in this form */
  fields: FieldDefinition[];
}
