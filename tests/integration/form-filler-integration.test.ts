import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIFormFiller } from '../../src/core/form-filler.js';
import { jobApplicationConfig } from '../fixtures/sample-form-config.js';
import { jobApplicationResponse, partialResponse } from '../fixtures/mock-llm-responses.js';
import type { LLMAdapter } from '../../src/types/llm-adapter.js';

function createJobForm(): HTMLFormElement {
  const form = document.createElement('form');
  form.id = 'job-form';
  form.innerHTML = `
    <input name="fullName" type="text" />
    <input name="email" type="email" />
    <input name="phone" type="tel" />
    <input name="yearsExperience" type="number" />
    <select name="position">
      <option value="">Select...</option>
      <option value="junior">Junior Engineer</option>
      <option value="mid">Mid-Level Engineer</option>
      <option value="senior">Senior Engineer</option>
      <option value="staff">Staff Engineer</option>
    </select>
    <input name="remoteOk" type="checkbox" />
    <input name="startDate" type="date" />
    <textarea name="coverLetter"></textarea>
  `;
  document.body.appendChild(form);
  return form;
}

beforeEach(() => {
  document.body.innerHTML = '';
});

describe('Full form fill integration', () => {
  it('fills all fields from a complete LLM response', async () => {
    const form = createJobForm();
    const adapter: LLMAdapter = {
      complete: vi.fn().mockResolvedValue(jobApplicationResponse),
    };

    const filler = new AIFormFiller({
      adapter,
      config: jobApplicationConfig,
      formElement: form,
    });

    const result = await filler.fill('Jane Doe resume data');

    expect(result.success).toBe(true);
    expect(result.filledCount).toBe(8);
    expect(result.skippedCount).toBe(0);

    expect(form.querySelector<HTMLInputElement>('[name="fullName"]')?.value).toBe('Jane Doe');
    expect(form.querySelector<HTMLInputElement>('[name="email"]')?.value).toBe('jane.doe@example.com');
    expect(form.querySelector<HTMLInputElement>('[name="phone"]')?.value).toBe('+1-555-0100');
    expect(form.querySelector<HTMLInputElement>('[name="yearsExperience"]')?.value).toBe('7');
    expect(form.querySelector<HTMLSelectElement>('[name="position"]')?.value).toBe('senior');
    expect(form.querySelector<HTMLInputElement>('[name="remoteOk"]')?.checked).toBe(true);
    expect(form.querySelector<HTMLInputElement>('[name="startDate"]')?.value).toBe('2026-04-01');
    expect(form.querySelector<HTMLTextAreaElement>('[name="coverLetter"]')?.value).toBe(
      'I am excited to apply for this position...'
    );
  });

  it('handles partial LLM response — leaves null fields empty', async () => {
    const form = createJobForm();
    const adapter: LLMAdapter = {
      complete: vi.fn().mockResolvedValue(partialResponse),
    };

    const filler = new AIFormFiller({
      adapter,
      config: jobApplicationConfig,
      formElement: form,
    });

    const result = await filler.fill('John Smith, mid-level, no contact info');

    expect(result.success).toBe(true);
    expect(result.filledCount).toBe(4); // fullName, email, position, remoteOk (false is a valid fill)
    expect(result.skippedCount).toBeGreaterThanOrEqual(4); // phone, yearsExperience, startDate, coverLetter are null

    expect(form.querySelector<HTMLInputElement>('[name="fullName"]')?.value).toBe('John Smith');
    expect(form.querySelector<HTMLInputElement>('[name="phone"]')?.value).toBe(''); // untouched
  });

  it('the adapter receives the field descriptions in the prompt', async () => {
    const form = createJobForm();
    const adapter: LLMAdapter = {
      complete: vi.fn().mockResolvedValue(jobApplicationResponse),
    };

    const filler = new AIFormFiller({
      adapter,
      config: jobApplicationConfig,
      formElement: form,
    });

    await filler.fill('resume data');

    const callArg = (adapter.complete as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(callArg?.userPrompt).toContain('Job Application Form');
    expect(callArg?.userPrompt).toContain('fullName');
    expect(callArg?.userPrompt).toContain('yearsExperience');
    expect(callArg?.userPrompt).toContain('"senior"');
  });

  it('the adapter receives the raw data in the prompt', async () => {
    const form = createJobForm();
    const adapter: LLMAdapter = {
      complete: vi.fn().mockResolvedValue(jobApplicationResponse),
    };

    const filler = new AIFormFiller({ adapter, config: jobApplicationConfig, formElement: form });
    await filler.fill('My name is Jane. I have 7 years of experience.');

    const callArg = (adapter.complete as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
    expect(callArg?.userPrompt).toContain('My name is Jane');
  });
});
