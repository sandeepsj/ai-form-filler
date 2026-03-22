import { useRef, useState } from 'react';
import { AIFormFillerProvider, useAIFormFiller } from 'ai-form-filler/react';
import { AnthropicAdapter } from 'ai-form-filler/adapters/anthropic';
import type { FormConfig } from 'ai-form-filler';

const jobFormConfig: FormConfig = {
  title: 'Job Application Form',
  fields: [
    { key: 'fullName', label: 'Full Name', type: 'text', required: true },
    { key: 'email', label: 'Email Address', type: 'email', required: true },
    { key: 'phone', label: 'Phone Number', type: 'tel' },
    { key: 'yearsExperience', label: 'Years of Experience', type: 'number' },
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
    { key: 'remoteOk', label: 'Open to Remote Work', type: 'checkbox' },
    { key: 'startDate', label: 'Earliest Start Date', type: 'date' },
    { key: 'coverLetter', label: 'Cover Letter', type: 'textarea' },
  ],
};

// Set up the adapter with your pre-configured client.
// API keys must NEVER live in the browser — configure a backend proxy.
// Example: Anthropic client pointed at your own backend endpoint.
import Anthropic from '@anthropic-ai/sdk';

const anthropicClient = new Anthropic({
  baseURL: '/api/anthropic-proxy', // Your backend endpoint
  apiKey: 'not-used',             // Required by SDK type but ignored by your proxy
  dangerouslyAllowBrowser: true,  // Only because your proxy handles auth server-side
});

const adapter = new AnthropicAdapter({
  client: anthropicClient,
  model: 'claude-haiku-4-5-20251001',
});

function JobApplicationForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [rawData, setRawData] = useState('');

  const { fill, isLoading, lastResult, error } = useAIFormFiller({
    config: jobFormConfig,
    formRef,
    onFillComplete: (result) => {
      console.log(`Filled ${result.filledCount} fields`);
    },
  });

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1>Job Application</h1>

      <div>
        <label htmlFor="raw-data"><strong>Paste your resume or notes:</strong></label>
        <textarea
          id="raw-data"
          rows={5}
          style={{ width: '100%', marginTop: 4, padding: 8 }}
          value={rawData}
          onChange={(e) => setRawData(e.target.value)}
          placeholder="e.g. Jane Doe, jane@example.com, 7 years experience, senior engineer..."
        />
        <button
          onClick={() => fill(rawData)}
          disabled={isLoading || !rawData.trim()}
          style={{ marginTop: 8, padding: '8px 16px', cursor: 'pointer' }}
        >
          {isLoading ? 'Filling...' : 'Autofill with AI'}
        </button>
        {lastResult && (
          <p style={{ color: lastResult.success ? 'green' : 'red' }}>
            {lastResult.success
              ? `Filled ${lastResult.filledCount} fields, skipped ${lastResult.skippedCount}`
              : `Error: ${lastResult.error?.message}`}
          </p>
        )}
        {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      </div>

      <hr />

      <form ref={formRef}>
        <div>
          <label>Full Name <input name="fullName" type="text" /></label>
        </div>
        <div>
          <label>Email <input name="email" type="email" /></label>
        </div>
        <div>
          <label>Phone <input name="phone" type="tel" /></label>
        </div>
        <div>
          <label>Years of Experience <input name="yearsExperience" type="number" /></label>
        </div>
        <div>
          <label>
            Position
            <select name="position">
              <option value="">Select...</option>
              <option value="junior">Junior Engineer</option>
              <option value="mid">Mid-Level Engineer</option>
              <option value="senior">Senior Engineer</option>
              <option value="staff">Staff Engineer</option>
            </select>
          </label>
        </div>
        <div>
          <label><input name="remoteOk" type="checkbox" /> Open to Remote</label>
        </div>
        <div>
          <label>Start Date <input name="startDate" type="date" /></label>
        </div>
        <div>
          <label>Cover Letter <textarea name="coverLetter" rows={4} /></label>
        </div>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <AIFormFillerProvider adapter={adapter}>
      <JobApplicationForm />
    </AIFormFillerProvider>
  );
}
