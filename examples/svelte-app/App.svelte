<script lang="ts">
  import { onMount } from 'svelte';
  import { createAIFormFillerStore } from 'ai-form-filler/svelte';
  import { AnthropicAdapter } from 'ai-form-filler/adapters/anthropic';
  import type { FormConfig } from 'ai-form-filler';

  const formConfig: FormConfig = {
    title: 'Job Application Form',
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', required: true },
      { key: 'email', label: 'Email Address', type: 'email', required: true },
      { key: 'phone', label: 'Phone Number', type: 'tel' },
      { key: 'yearsExperience', label: 'Years of Experience', type: 'number' },
      {
        key: 'position',
        label: 'Position',
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

  let formEl: HTMLFormElement;
  let rawData = '';

  // API keys must NEVER live in the browser — configure a backend proxy.
  // Your Anthropic client points to your own backend endpoint.
  import Anthropic from '@anthropic-ai/sdk';
  const anthropicClient = new Anthropic({
    baseURL: '/api/anthropic-proxy', // Your backend endpoint
    apiKey: 'not-used',
    dangerouslyAllowBrowser: true,
  });
  const adapter = new AnthropicAdapter({ client: anthropicClient, model: 'claude-haiku-4-5-20251001' });

  // Store is created after mount so formEl is available
  let store: ReturnType<typeof createAIFormFillerStore> | null = null;

  onMount(() => {
    store = createAIFormFillerStore({ adapter, config: formConfig, formElement: formEl });
  });

  async function handleAutofill() {
    if (!store || !rawData.trim()) return;
    await store.fill(rawData);
  }
</script>

<div style="max-width: 600px; margin: 40px auto; padding: 0 20px; font-family: sans-serif;">
  <h1>Job Application (Svelte)</h1>

  <label for="raw-data"><strong>Paste your resume or notes:</strong></label>
  <textarea
    id="raw-data"
    rows="5"
    style="width: 100%; margin-top: 4px; padding: 8px;"
    bind:value={rawData}
    placeholder="e.g. Jane Doe, jane@example.com, 7 years experience..."
  ></textarea>

  <button
    on:click={handleAutofill}
    disabled={!store || $store?.loading || !rawData.trim()}
    style="margin-top: 8px; padding: 8px 16px; cursor: pointer;"
  >
    {$store?.loading ? 'Filling...' : 'Autofill with AI'}
  </button>

  {#if $store?.result}
    <p style="color: {$store.result.success ? 'green' : 'red'}">
      {$store.result.success
        ? `Filled ${$store.result.filledCount} fields`
        : `Error: ${$store.result.error?.message}`}
    </p>
  {/if}

  <hr />

  <form bind:this={formEl}>
    <label>Full Name <input name="fullName" type="text" /></label>
    <label>Email <input name="email" type="email" /></label>
    <label>Phone <input name="phone" type="tel" /></label>
    <label>Years of Experience <input name="yearsExperience" type="number" /></label>
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
    <label><input name="remoteOk" type="checkbox" /> Open to Remote</label>
    <label>Start Date <input name="startDate" type="date" /></label>
    <label>Cover Letter <textarea name="coverLetter" rows="4"></textarea></label>
  </form>
</div>
