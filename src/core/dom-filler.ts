import type { FieldDefinition } from '../types/form-config.js';
import type { FieldFillStatus } from '../types/fill-result.js';

type LLMValue = string | number | boolean | null | undefined;

/**
 * Fills DOM form inputs based on LLM-returned values.
 * Dispatches both `input` and `change` events so React/Vue/Svelte reactive bindings update.
 */
export function fillDom(
  fields: FieldDefinition[],
  values: Record<string, LLMValue>,
  formElement?: HTMLFormElement | null
): FieldFillStatus[] {
  const results: FieldFillStatus[] = [];

  for (const field of fields) {
    const value = values[field.key];

    if (value === null || value === undefined) {
      results.push({ key: field.key, status: 'skipped', value: null });
      continue;
    }

    try {
      const element = resolveElement(field.key, field.selector, formElement);

      if (!element) {
        results.push({ key: field.key, status: 'not-found', value });
        continue;
      }

      fillElement(element, field, value);
      results.push({ key: field.key, status: 'filled', value });
    } catch (err) {
      results.push({
        key: field.key,
        status: 'error',
        value,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}

function resolveElement(
  key: string,
  selector: string | undefined,
  formElement?: HTMLFormElement | null
): Element | null {
  const scope: ParentNode = formElement ?? document;

  // 1. Explicit selector override
  if (selector) {
    return scope.querySelector(selector);
  }

  // 2. [name="key"] scoped to form
  const byName = scope.querySelector(`[name="${CSS.escape(key)}"]`);
  if (byName) return byName;

  // 3. Global [name="key"]
  if (formElement) {
    const globalByName = document.querySelector(`[name="${CSS.escape(key)}"]`);
    if (globalByName) return globalByName;
  }

  // 4. #id fallback
  return document.getElementById(key);
}

function fillElement(element: Element, field: FieldDefinition, value: LLMValue): void {
  const type = field.type;

  if (type === 'checkbox') {
    const input = element as HTMLInputElement;
    const checked = value === true || value === 'true' || value === 1;
    if (input.checked !== checked) {
      input.checked = checked;
      dispatch(input, 'change');
    }
    return;
  }

  if (type === 'radio') {
    // For radio, find the specific input with the matching value
    const radioValue = String(value);
    const scope: ParentNode = element.closest('form') ?? document;
    const radio = scope.querySelector<HTMLInputElement>(
      `input[type="radio"][name="${CSS.escape(field.key)}"][value="${CSS.escape(radioValue)}"]`
    );
    if (radio && !radio.checked) {
      radio.checked = true;
      dispatch(radio, 'change');
    }
    return;
  }

  if (type === 'select') {
    const select = element as HTMLSelectElement;
    const strValue = String(value);
    if (select.value !== strValue) {
      select.value = strValue;
      dispatch(select, 'input');
      dispatch(select, 'change');
    }
    return;
  }

  // All remaining types: text, email, password, number, tel, url, date, datetime-local, time, textarea
  const input = element as HTMLInputElement | HTMLTextAreaElement;
  const strValue = String(value);
  if (input.value !== strValue) {
    // Use native input value setter to ensure React's synthetic event fires
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype,
      'value'
    )?.set;

    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, strValue);
    } else {
      input.value = strValue;
    }

    dispatch(input, 'input');
    dispatch(input, 'change');
  }
}

function dispatch(element: Element, eventType: string): void {
  element.dispatchEvent(new Event(eventType, { bubbles: true }));
}
