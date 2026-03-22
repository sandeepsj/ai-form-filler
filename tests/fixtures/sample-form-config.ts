import type { FormConfig } from '../../src/types/form-config.js';

export const jobApplicationConfig: FormConfig = {
  title: 'Job Application Form',
  description: 'Application for a software engineering position',
  fields: [
    {
      key: 'fullName',
      label: 'Full Name',
      description: 'Applicant full legal name',
      type: 'text',
      required: true,
    },
    {
      key: 'email',
      label: 'Email Address',
      type: 'email',
      required: true,
    },
    {
      key: 'phone',
      label: 'Phone Number',
      type: 'tel',
    },
    {
      key: 'yearsExperience',
      label: 'Years of Experience',
      description: 'Total years of professional software development experience',
      type: 'number',
    },
    {
      key: 'position',
      label: 'Position Applied For',
      type: 'select',
      options: [
        { value: 'junior', label: 'Junior Engineer' },
        { value: 'mid', label: 'Mid-Level Engineer' },
        { value: 'senior', label: 'Senior Engineer' },
        { value: 'staff', label: 'Staff Engineer' },
      ],
      required: true,
    },
    {
      key: 'remoteOk',
      label: 'Open to Remote Work',
      type: 'checkbox',
    },
    {
      key: 'startDate',
      label: 'Earliest Start Date',
      type: 'date',
    },
    {
      key: 'coverLetter',
      label: 'Cover Letter',
      description: 'Brief introduction and motivation for applying',
      type: 'textarea',
    },
  ],
};

export const simpleContactConfig: FormConfig = {
  title: 'Contact Form',
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'message', label: 'Message', type: 'textarea' },
  ],
};
