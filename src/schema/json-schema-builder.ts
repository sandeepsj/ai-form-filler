import type { FieldDefinition, FieldType } from '../types/form-config.js';

type JsonSchemaProperty =
  | { type: 'string'; description?: string }
  | { type: 'string'; enum: string[]; description?: string }
  | { type: 'string'; format: string; description?: string }
  | { type: 'number'; description?: string }
  | { type: 'boolean'; description?: string }
  | { anyOf: [{ type: string }, { type: 'null' }]; description?: string };

function fieldTypeToJsonSchemaType(
  type: FieldType,
  options?: Array<{ value: string; label: string }>
): JsonSchemaProperty {
  switch (type) {
    case 'select':
    case 'radio':
      return {
        type: 'string',
        enum: (options ?? []).map((o) => o.value),
      };
    case 'number':
      return { type: 'number' };
    case 'checkbox':
      return { type: 'boolean' };
    case 'date':
      return { type: 'string', format: 'date' };
    case 'datetime-local':
      return { type: 'string', format: 'date-time' };
    case 'time':
      return { type: 'string', format: 'time' };
    default:
      // text, email, password, tel, url, textarea
      return { type: 'string' };
  }
}

/**
 * Converts a list of FieldDefinitions into a JSON Schema object.
 * This schema is embedded in the LLM prompt so it returns structured, typed output.
 */
export function buildJsonSchema(fields: FieldDefinition[]): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const field of fields) {
    const baseType = fieldTypeToJsonSchemaType(field.type, field.options);
    const description = field.description ?? field.label;

    // Wrap in anyOf with null to allow the LLM to leave fields empty
    properties[field.key] = {
      anyOf: [baseType, { type: 'null' }],
      description,
    };

    if (field.required) {
      required.push(field.key);
    }
  }

  return {
    type: 'object',
    properties,
    required: required.length > 0 ? required : undefined,
    additionalProperties: false,
  };
}
