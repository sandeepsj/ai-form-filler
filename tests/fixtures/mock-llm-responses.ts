import type { LLMAdapterResponse } from '../../src/types/llm-adapter.js';

export const jobApplicationResponse: LLMAdapterResponse = {
  fields: {
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1-555-0100',
    yearsExperience: 7,
    position: 'senior',
    remoteOk: true,
    startDate: '2026-04-01',
    coverLetter: 'I am excited to apply for this position...',
  },
  rawResponse: JSON.stringify({
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1-555-0100',
    yearsExperience: 7,
    position: 'senior',
    remoteOk: true,
    startDate: '2026-04-01',
    coverLetter: 'I am excited to apply for this position...',
  }),
};

export const partialResponse: LLMAdapterResponse = {
  fields: {
    fullName: 'John Smith',
    email: 'john@example.com',
    phone: null,
    yearsExperience: null,
    position: 'mid',
    remoteOk: false,
    startDate: null,
    coverLetter: null,
  },
};

export const emptyResponse: LLMAdapterResponse = {
  fields: {
    fullName: null,
    email: null,
    phone: null,
    yearsExperience: null,
    position: null,
    remoteOk: null,
    startDate: null,
    coverLetter: null,
  },
};
