import type { RunLLMMessage, BackgroundResponse } from '../shared/messages.js';
import { createAdapter, runLLMPipeline } from './llm-service.js';

chrome.runtime.onMessage.addListener(
  (message: RunLLMMessage, _sender, sendResponse: (response: BackgroundResponse) => void) => {
    if (message.type !== 'RUN_LLM') return false;

    const { config, profileData, provider, apiKey, model } = message;

    const adapter = createAdapter(provider, apiKey, model);

    runLLMPipeline(config, profileData, adapter)
      .then((values) => {
        sendResponse({ type: 'LLM_RESULT', values });
      })
      .catch((err) => {
        sendResponse({
          type: 'LLM_ERROR',
          error: err instanceof Error ? err.message : String(err),
        });
      });

    return true; // keep message channel open for async response
  }
);
