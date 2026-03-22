import { describe, it, expect } from 'vitest';
import { validateFormConfig } from '../../src/schema/zod-schemas.js';

describe('validateFormConfig', () => {
  it('accepts a valid minimal config', () => {
    const result = validateFormConfig({
      title: 'My Form',
      fields: [{ key: 'name', label: 'Name', type: 'text' }],
    });
    expect(result.success).toBe(true);
  });

  it('accepts all field types', () => {
    const types = [
      'text', 'email', 'password', 'number', 'tel', 'url',
      'date', 'datetime-local', 'time', 'textarea', 'checkbox',
    ];
    for (const type of types) {
      const result = validateFormConfig({
        title: 'Form',
        fields: [{ key: 'f', label: 'F', type }],
      });
      expect(result.success, `type ${type}`).toBe(true);
    }
  });

  it('accepts select with options', () => {
    const result = validateFormConfig({
      title: 'Form',
      fields: [
        {
          key: 'role',
          label: 'Role',
          type: 'select',
          options: [{ value: 'admin', label: 'Admin' }],
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects select without options', () => {
    const result = validateFormConfig({
      title: 'Form',
      fields: [{ key: 'role', label: 'Role', type: 'select' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const result = validateFormConfig({
      title: '',
      fields: [{ key: 'name', label: 'Name', type: 'text' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty fields array', () => {
    const result = validateFormConfig({ title: 'Form', fields: [] });
    expect(result.success).toBe(false);
  });

  it('rejects duplicate field keys', () => {
    const result = validateFormConfig({
      title: 'Form',
      fields: [
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'name', label: 'Name 2', type: 'email' },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid field type', () => {
    const result = validateFormConfig({
      title: 'Form',
      fields: [{ key: 'x', label: 'X', type: 'file' }],
    });
    expect(result.success).toBe(false);
  });
});
