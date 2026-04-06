import type { FieldDefinition, FieldType, SelectOption, FormConfig } from '@lib/types/form-config.js';

const SKIP_INPUT_TYPES = new Set(['hidden', 'submit', 'button', 'image', 'reset', 'file']);

export function detectFormFields(formElement?: HTMLFormElement): FormConfig {
  const scope: ParentNode = formElement ?? document;
  const elements = scope.querySelectorAll<HTMLElement>('input, textarea, select');

  const fields: FieldDefinition[] = [];
  const seenKeys = new Set<string>();

  for (const el of elements) {
    const field = elementToFieldDefinition(el);
    if (!field) continue;
    if (seenKeys.has(field.key)) continue;
    seenKeys.add(field.key);
    fields.push(field);
  }

  return {
    title: deriveFormTitle(formElement),
    fields,
  };
}

function elementToFieldDefinition(el: HTMLElement): FieldDefinition | null {
  if (el instanceof HTMLInputElement) {
    const inputType = (el.type || 'text').toLowerCase();

    if (SKIP_INPUT_TYPES.has(inputType)) return null;
    // Skip password fields for security
    if (inputType === 'password') return null;

    const key = el.name || el.id;
    if (!key) return null;

    if (inputType === 'radio') {
      return buildRadioField(el);
    }

    if (inputType === 'checkbox') {
      return {
        key,
        label: findLabel(el) || key,
        type: 'checkbox',
        required: el.required || el.getAttribute('aria-required') === 'true',
      };
    }

    const type = mapInputType(inputType);
    return {
      key,
      label: findLabel(el) || key,
      type,
      required: el.required || el.getAttribute('aria-required') === 'true',
    };
  }

  if (el instanceof HTMLTextAreaElement) {
    const key = el.name || el.id;
    if (!key) return null;
    return {
      key,
      label: findLabel(el) || key,
      type: 'textarea',
      required: el.required || el.getAttribute('aria-required') === 'true',
    };
  }

  if (el instanceof HTMLSelectElement) {
    const key = el.name || el.id;
    if (!key) return null;

    const options: SelectOption[] = [];
    for (const opt of el.options) {
      if (opt.value === '') continue; // skip placeholder options
      options.push({ value: opt.value, label: opt.text || opt.value });
    }

    return {
      key,
      label: findLabel(el) || key,
      type: 'select',
      options,
      required: el.required || el.getAttribute('aria-required') === 'true',
    };
  }

  return null;
}

function buildRadioField(el: HTMLInputElement): FieldDefinition | null {
  const key = el.name;
  if (!key) return null;

  const scope = el.closest('form') ?? document;
  const radios = scope.querySelectorAll<HTMLInputElement>(
    `input[type="radio"][name="${CSS.escape(key)}"]`
  );

  const options: SelectOption[] = [];
  let groupLabel = '';

  for (const radio of radios) {
    const label = findLabel(radio) || radio.value;
    options.push({ value: radio.value, label });
    if (!groupLabel) {
      // Try to find a fieldset legend or group label
      const fieldset = radio.closest('fieldset');
      const legend = fieldset?.querySelector('legend');
      if (legend) groupLabel = legend.textContent?.trim() || '';
    }
  }

  if (!groupLabel) {
    groupLabel = findLabel(el) || key;
  }

  return {
    key,
    label: groupLabel,
    type: 'radio',
    options,
    required: el.required || el.getAttribute('aria-required') === 'true',
  };
}

function mapInputType(htmlType: string): FieldType {
  const mapping: Record<string, FieldType> = {
    text: 'text',
    email: 'email',
    number: 'number',
    tel: 'tel',
    url: 'url',
    date: 'date',
    'datetime-local': 'datetime-local',
    time: 'time',
    search: 'text',
    month: 'text',
    week: 'text',
    color: 'text',
    range: 'number',
  };
  return mapping[htmlType] || 'text';
}

function findLabel(el: HTMLElement): string {
  // 1. <label for="id">
  if (el.id) {
    const label = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(el.id)}"]`);
    if (label) return label.textContent?.trim() || '';
  }

  // 2. aria-label
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel.trim();

  // 3. aria-labelledby
  const labelledBy = el.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelEl = document.getElementById(labelledBy);
    if (labelEl) return labelEl.textContent?.trim() || '';
  }

  // 4. Parent <label> wrapping the input
  const parentLabel = el.closest('label');
  if (parentLabel) {
    // Get text content excluding the input itself
    const clone = parentLabel.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('input, select, textarea').forEach((c) => c.remove());
    const text = clone.textContent?.trim();
    if (text) return text;
  }

  // 5. placeholder
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    if (el.placeholder) return el.placeholder;
  }

  // 6. title attribute
  const title = el.getAttribute('title');
  if (title) return title.trim();

  return '';
}

function deriveFormTitle(formElement?: HTMLFormElement): string {
  if (formElement) {
    const title = formElement.getAttribute('title') || formElement.getAttribute('aria-label');
    if (title) return title.trim();

    const legend = formElement.querySelector('legend');
    if (legend?.textContent) return legend.textContent.trim();
  }

  if (document.title) return document.title;

  return `Form on ${location.hostname}`;
}
