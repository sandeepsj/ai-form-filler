import type { FormConfig } from '../types/form-config.js';
import { SYSTEM_PROMPT } from './system-prompt.js';

export interface BuiltPrompt {
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Assembles the system and user prompts from the form config, normalized raw data, and JSON schema.
 */
export function buildPrompt(
  config: FormConfig,
  normalizedData: string,
  jsonSchema: Record<string, unknown>
): BuiltPrompt {
  const fieldLines = config.fields
    .map((field) => {
      const parts: string[] = [`- **${field.key}** (${field.type}): ${field.label}`];
      if (field.description) {
        parts.push(`  Description: ${field.description}`);
      }
      if (field.options && field.options.length > 0) {
        const opts = field.options.map((o) => `"${o.value}" (${o.label})`).join(', ');
        parts.push(`  Allowed values: ${opts}`);
      }
      if (field.required) {
        parts.push(`  Required: yes`);
      }
      return parts.join('\n');
    })
    .join('\n\n');

  const userPrompt = `## Form: ${config.title}${config.description ? `\n${config.description}` : ''}

## Fields to fill:

${fieldLines}

## Raw data provided:

${normalizedData}

## Required response schema:

${JSON.stringify(jsonSchema, null, 2)}

Return only the JSON object matching the schema above. No markdown, no explanation.`;

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
  };
}
