import { detectFormFields } from './form-detector.js';
import { fillDom } from '@lib/core/dom-filler.js';
import type { PopupToContentMessage, ContentResponse } from '../shared/messages.js';

chrome.runtime.onMessage.addListener(
  (message: PopupToContentMessage, _sender, sendResponse: (response: ContentResponse) => void) => {
    if (message.type === 'DETECT_FIELDS') {
      try {
        const config = detectFormFields();
        sendResponse({ type: 'FIELDS_DETECTED', config });
      } catch (err) {
        sendResponse({ type: 'ERROR', error: err instanceof Error ? err.message : String(err) });
      }
      return false; // synchronous response
    }

    if (message.type === 'FILL_DOM') {
      try {
        const results = fillDom(message.fields, message.values as Record<string, string | number | boolean | null>);
        sendResponse({ type: 'FILL_COMPLETE', results });
      } catch (err) {
        sendResponse({ type: 'ERROR', error: err instanceof Error ? err.message : String(err) });
      }
      return false;
    }

    return false;
  }
);
