# ai-form-filler

AI-powered autofill for any HTML form. Dump raw data (resume text, notes, JSON) → the library calls an LLM → fills your form inputs automatically.

Works with React, Svelte, Vanilla JS, or any framework. Ships as an npm package and a UMD bundle for CDN usage.

---

## Installation

```bash
npm install ai-form-filler
# Plus your LLM SDK of choice:
npm install @anthropic-ai/sdk   # for Anthropic Claude
npm install openai              # for OpenAI GPT
```

---

## Quick Start

### Vanilla JS / Core

```ts
import Anthropic from '@anthropic-ai/sdk';
import { AIFormFiller } from 'ai-form-filler';
import { AnthropicAdapter } from 'ai-form-filler/adapters/anthropic';

// Point to your backend proxy — never expose API keys in frontend code
const client = new Anthropic({ baseURL: '/api/anthropic-proxy', apiKey: 'ignored', dangerouslyAllowBrowser: true });
const adapter = new AnthropicAdapter({ client });

const filler = new AIFormFiller({
  adapter,
  config: {
    title: 'Job Application',
    fields: [
      { key: 'fullName', label: 'Full Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'email', required: true },
      {
        key: 'level',
        label: 'Seniority Level',
        type: 'select',
        options: [
          { value: 'junior', label: 'Junior' },
          { value: 'senior', label: 'Senior' },
        ],
      },
    ],
  },
  formElement: document.getElementById('my-form') as HTMLFormElement,
});

const result = await filler.fill(`
  My name is Jane Doe. Email: jane@example.com.
  I have 8 years of experience and consider myself a senior engineer.
`);

console.log(`Filled ${result.filledCount} fields`);
```

---

### React

```tsx
import { AIFormFillerProvider, useAIFormFiller } from 'ai-form-filler/react';
import { AnthropicAdapter } from 'ai-form-filler/adapters/anthropic';

// Point to your backend proxy — never expose API keys in frontend code
const client = new Anthropic({ baseURL: '/api/anthropic-proxy', apiKey: 'ignored', dangerouslyAllowBrowser: true });
const adapter = new AnthropicAdapter({ client });

function MyForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const { fill, isLoading } = useAIFormFiller({
    config: {
      title: 'Contact Form',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
      ],
    },
    formRef,
  });

  return (
    <AIFormFillerProvider adapter={adapter}>
      <form ref={formRef}>
        <input name="name" type="text" />
        <input name="email" type="email" />
        <button type="button" onClick={() => fill('Jane Doe, jane@example.com')}>
          {isLoading ? 'Filling...' : 'Autofill'}
        </button>
      </form>
    </AIFormFillerProvider>
  );
}
```

> Note: Wrap your component tree in `<AIFormFillerProvider>` at the top level.

---

### Svelte

```svelte
<script lang="ts">
  import { createAIFormFillerStore } from 'ai-form-filler/svelte';
  import { AnthropicAdapter } from 'ai-form-filler/adapters/anthropic';

  let formEl: HTMLFormElement;
  const adapter = new AnthropicAdapter({ apiKey: 'YOUR_KEY' });

  const { fill, loading, result } = createAIFormFillerStore({
    adapter,
    config: {
      title: 'Contact Form',
      fields: [{ key: 'name', label: 'Name', type: 'text' }],
    },
    formElement: formEl,
  });
</script>

<form bind:this={formEl}>
  <input name="name" type="text" />
  <button on:click={() => fill('Jane Doe')} disabled={$loading}>Autofill</button>
</form>
{#if $result}Filled {$result.filledCount} fields{/if}
```

---

### UMD / CDN

```html
<script src="https://cdn.jsdelivr.net/npm/ai-form-filler/dist/ai-form-filler.umd.js"></script>
<script>
  const { AIFormFiller } = AIFormFiller;
  // Provide your own adapter implementation (LLM SDKs are not bundled in UMD)
</script>
```

---

## Adapters

### Security: No API keys in the browser

`ai-form-filler` **does not accept API keys**. You must provide a pre-configured SDK client. This keeps secrets on your server, not in frontend bundles.

The recommended pattern is to run a lightweight proxy on your backend that forwards requests to the LLM provider, so the SDK `baseURL` points to your own endpoint.

### Anthropic Claude

```ts
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicAdapter } from 'ai-form-filler/adapters/anthropic';

// Your backend proxies /api/anthropic → api.anthropic.com, adds the API key server-side
const client = new Anthropic({
  baseURL: '/api/anthropic-proxy',
  apiKey: 'ignored',                  // your proxy injects the real key
  dangerouslyAllowBrowser: true,      // safe because proxy handles auth
});

const adapter = new AnthropicAdapter({
  client,
  model: 'claude-haiku-4-5-20251001', // default
  maxTokens: 2048,                    // default
});
```

### OpenAI GPT

```ts
import OpenAI from 'openai';
import { OpenAIAdapter } from 'ai-form-filler/adapters/openai';

// Your backend proxies /api/openai → api.openai.com, adds the API key server-side
const client = new OpenAI({
  baseURL: '/api/openai-proxy',
  apiKey: 'ignored',
  dangerouslyAllowBrowser: true,
});

const adapter = new OpenAIAdapter({
  client,
  model: 'gpt-4o-mini',  // default; gpt-4o+ uses structured outputs
  temperature: 0,        // default
});
```

### Custom Adapter

Implement the `LLMAdapter` interface to use any LLM provider:

```ts
import type { LLMAdapter, LLMAdapterRequest, LLMAdapterResponse } from 'ai-form-filler';

class MyCustomAdapter implements LLMAdapter {
  async complete(request: LLMAdapterRequest): Promise<LLMAdapterResponse> {
    // Call your LLM with request.systemPrompt and request.userPrompt
    // Parse the JSON response into { fields: { key: value, ... } }
    return { fields: { name: 'Jane', email: 'jane@example.com' } };
  }
}
```

---

## API Reference

### `FormConfig`

```ts
interface FormConfig {
  title: string;
  description?: string;
  fields: FieldDefinition[];
}
```

### `FieldDefinition`

```ts
interface FieldDefinition {
  key: string;          // must match HTML input name/id
  label: string;
  description?: string; // extra context for the LLM
  type: FieldType;      // 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'date' | ...
  options?: SelectOption[];  // required for 'select' and 'radio' types
  required?: boolean;
  selector?: string;    // override CSS selector (default: [name="key"])
}
```

### `FieldType`

`'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'datetime-local' | 'time' | 'textarea' | 'select' | 'radio' | 'checkbox'`

### `RawDataInput`

`string | Record<string, unknown> | File`

### `FillResult`

```ts
interface FillResult {
  success: boolean;
  filledCount: number;
  skippedCount: number;   // fields where LLM returned null
  fields: FieldFillStatus[];
  error?: Error;
}

interface FieldFillStatus {
  key: string;
  status: 'filled' | 'skipped' | 'not-found' | 'error';
  value?: string | number | boolean | null;
  error?: string;
}
```

### `AIFormFiller`

```ts
class AIFormFiller {
  constructor(options: AIFormFillerOptions);
  fill(input: RawDataInput, hint?: string): Promise<FillResult>;
  updateConfig(config: FormConfig): void;
  updateFormElement(formElement: HTMLFormElement | null): void;
}

interface AIFormFillerOptions {
  adapter: LLMAdapter;
  config: FormConfig;
  formElement?: HTMLFormElement | null;
  onFieldFilled?: (status: FieldFillStatus) => void;
}
```

---

## How It Works

1. **Normalize** — converts the raw data dump to a plain string (handles text, objects, Files)
2. **Schema** — builds a JSON Schema from your `FieldDefinition[]` so the LLM returns typed values
3. **Prompt** — constructs a system + user prompt with field descriptions, options, and the raw data
4. **LLM** — sends to your adapter; receives `{ fieldKey: value, ... }` JSON
5. **Fill** — locates each input by `name`/`id`/custom selector, sets its value, dispatches `input`+`change` events (React-compatible)

Fields where the LLM returns `null` are left untouched.

---

## Chrome Extension

A ready-to-use Chrome extension that auto-fills **any** form on any website — job applications, government forms, signups, checkout pages, etc.

### Install (Developer Mode)

1. Clone this repo:
   ```bash
   git clone https://github.com/sandeepsj/ai-form-filler.git
   cd ai-form-filler/extension
   npm install
   npm run build
   ```

2. Open Chrome → go to `chrome://extensions`

3. Enable **Developer mode** (toggle in the top-right)

4. Click **"Load unpacked"** → select the `extension/dist` folder

5. Pin the extension from the puzzle piece icon in your toolbar

### Setup

1. Click the extension icon → **Settings** tab
2. Pick your LLM provider (OpenAI or Anthropic) and paste your API key
3. Go to the **Profiles** tab → click **"+ Add Profile"**
4. Give it a name (e.g. "My Resume", "Home Address") and paste your data
5. Check the checkbox next to profiles you want to use

### Usage

1. Navigate to any page with a form
2. Click the extension icon → **Fill** tab → **"Fill This Page"**
3. The extension auto-detects all form fields, sends them + your profile data to the LLM, and fills the form

You can create multiple profiles (resume, personal info, company details) and select which ones to use before filling.

### Updating

```bash
cd ai-form-filler/extension
git pull
npm install
npm run build
```

Then go to `chrome://extensions` and click the refresh icon on the extension card.

---

## License

MIT
