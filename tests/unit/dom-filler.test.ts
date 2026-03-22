import { describe, it, expect, beforeEach } from 'vitest';
import { fillDom } from '../../src/core/dom-filler.js';
import type { FieldDefinition } from '../../src/types/form-config.js';

function createForm(html: string): HTMLFormElement {
  const form = document.createElement('form');
  form.innerHTML = html;
  document.body.appendChild(form);
  return form;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('fillDom', () => {
  it('fills a text input', () => {
    const form = createForm('<input name="name" type="text" />');
    const fields: FieldDefinition[] = [{ key: 'name', label: 'Name', type: 'text' }];

    const results = fillDom(fields, { name: 'John Doe' }, form);

    expect(form.querySelector<HTMLInputElement>('[name="name"]')?.value).toBe('John Doe');
    expect(results[0]?.status).toBe('filled');
  });

  it('fills an email input', () => {
    const form = createForm('<input name="email" type="email" />');
    const fields: FieldDefinition[] = [{ key: 'email', label: 'Email', type: 'email' }];

    fillDom(fields, { email: 'test@example.com' }, form);

    expect(form.querySelector<HTMLInputElement>('[name="email"]')?.value).toBe('test@example.com');
  });

  it('fills a number input', () => {
    const form = createForm('<input name="age" type="number" />');
    const fields: FieldDefinition[] = [{ key: 'age', label: 'Age', type: 'number' }];

    fillDom(fields, { age: 25 }, form);

    expect(form.querySelector<HTMLInputElement>('[name="age"]')?.value).toBe('25');
  });

  it('fills a select input', () => {
    const form = createForm(`
      <select name="role">
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
    `);
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

    fillDom(fields, { role: 'admin' }, form);

    expect(form.querySelector<HTMLSelectElement>('[name="role"]')?.value).toBe('admin');
  });

  it('fills a checkbox input', () => {
    const form = createForm('<input name="agree" type="checkbox" />');
    const fields: FieldDefinition[] = [{ key: 'agree', label: 'Agree', type: 'checkbox' }];

    fillDom(fields, { agree: true }, form);

    expect(form.querySelector<HTMLInputElement>('[name="agree"]')?.checked).toBe(true);
  });

  it('unchecks a checkbox when value is false', () => {
    const form = createForm('<input name="agree" type="checkbox" checked />');
    const fields: FieldDefinition[] = [{ key: 'agree', label: 'Agree', type: 'checkbox' }];

    fillDom(fields, { agree: false }, form);

    expect(form.querySelector<HTMLInputElement>('[name="agree"]')?.checked).toBe(false);
  });

  it('fills a textarea', () => {
    const form = createForm('<textarea name="bio"></textarea>');
    const fields: FieldDefinition[] = [{ key: 'bio', label: 'Bio', type: 'textarea' }];

    fillDom(fields, { bio: 'Hello world' }, form);

    expect(form.querySelector<HTMLTextAreaElement>('[name="bio"]')?.value).toBe('Hello world');
  });

  it('returns skipped for null values', () => {
    const form = createForm('<input name="name" type="text" />');
    const fields: FieldDefinition[] = [{ key: 'name', label: 'Name', type: 'text' }];

    const results = fillDom(fields, { name: null }, form);

    expect(results[0]?.status).toBe('skipped');
    expect(form.querySelector<HTMLInputElement>('[name="name"]')?.value).toBe('');
  });

  it('returns not-found when element does not exist', () => {
    const form = createForm('');
    const fields: FieldDefinition[] = [{ key: 'missing', label: 'Missing', type: 'text' }];

    const results = fillDom(fields, { missing: 'value' }, form);

    expect(results[0]?.status).toBe('not-found');
  });

  it('uses custom selector when provided', () => {
    const form = createForm('<input id="custom-id" type="text" />');
    const fields: FieldDefinition[] = [
      { key: 'x', label: 'X', type: 'text', selector: '#custom-id' },
    ];

    fillDom(fields, { x: 'custom value' }, form);

    expect(form.querySelector<HTMLInputElement>('#custom-id')?.value).toBe('custom value');
  });

  it('dispatches input and change events', () => {
    const form = createForm('<input name="name" type="text" />');
    const input = form.querySelector<HTMLInputElement>('[name="name"]')!;
    const fields: FieldDefinition[] = [{ key: 'name', label: 'Name', type: 'text' }];

    const inputEvents: Event[] = [];
    const changeEvents: Event[] = [];
    input.addEventListener('input', (e) => inputEvents.push(e));
    input.addEventListener('change', (e) => changeEvents.push(e));

    fillDom(fields, { name: 'Test' }, form);

    expect(inputEvents.length).toBeGreaterThan(0);
    expect(changeEvents.length).toBeGreaterThan(0);
  });
});
