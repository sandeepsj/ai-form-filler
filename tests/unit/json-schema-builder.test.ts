import { describe, it, expect } from 'vitest';
import { buildJsonSchema } from '../../src/schema/json-schema-builder.js';
import type { FieldDefinition } from '../../src/types/form-config.js';

describe('buildJsonSchema', () => {
  it('generates object schema with properties', () => {
    const fields: FieldDefinition[] = [
      { key: 'name', label: 'Name', type: 'text' },
    ];
    const schema = buildJsonSchema(fields);
    expect(schema.type).toBe('object');
    expect(schema.properties).toBeDefined();
  });

  it('wraps each field in anyOf with null', () => {
    const fields: FieldDefinition[] = [
      { key: 'name', label: 'Name', type: 'text' },
    ];
    const schema = buildJsonSchema(fields);
    const props = schema.properties as Record<string, { anyOf: unknown[] }>;
    expect(props['name']?.anyOf).toHaveLength(2);
    expect(props['name']?.anyOf).toContainEqual({ type: 'null' });
  });

  it('generates enum for select fields', () => {
    const fields: FieldDefinition[] = [
      {
        key: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { value: 'admin', label: 'Admin' },
          { value: 'user', label: 'User' },
        ],
      },
    ];
    const schema = buildJsonSchema(fields);
    const props = schema.properties as Record<string, { anyOf: Array<{ enum?: string[] }> }>;
    const enumPart = props['role']?.anyOf.find((x) => 'enum' in x);
    expect(enumPart?.enum).toEqual(['admin', 'user']);
  });

  it('generates boolean for checkbox fields', () => {
    const fields: FieldDefinition[] = [
      { key: 'agree', label: 'Agree', type: 'checkbox' },
    ];
    const schema = buildJsonSchema(fields);
    const props = schema.properties as Record<string, { anyOf: Array<{ type: string }> }>;
    const boolPart = props['agree']?.anyOf.find((x) => x.type === 'boolean');
    expect(boolPart).toBeDefined();
  });

  it('generates number type for number fields', () => {
    const fields: FieldDefinition[] = [
      { key: 'age', label: 'Age', type: 'number' },
    ];
    const schema = buildJsonSchema(fields);
    const props = schema.properties as Record<string, { anyOf: Array<{ type: string }> }>;
    const numPart = props['age']?.anyOf.find((x) => x.type === 'number');
    expect(numPart).toBeDefined();
  });

  it('adds required array for required fields', () => {
    const fields: FieldDefinition[] = [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'bio', label: 'Bio', type: 'textarea' },
    ];
    const schema = buildJsonSchema(fields);
    expect(schema.required).toContain('name');
    expect(schema.required).not.toContain('bio');
  });

  it('omits required array when no required fields', () => {
    const fields: FieldDefinition[] = [
      { key: 'name', label: 'Name', type: 'text' },
    ];
    const schema = buildJsonSchema(fields);
    expect(schema.required).toBeUndefined();
  });

  it('sets additionalProperties: false', () => {
    const schema = buildJsonSchema([{ key: 'x', label: 'X', type: 'text' }]);
    expect(schema.additionalProperties).toBe(false);
  });
});
