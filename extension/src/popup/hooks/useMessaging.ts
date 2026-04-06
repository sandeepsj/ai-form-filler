import type { PopupToContentMessage, ContentResponse, RunLLMMessage, BackgroundResponse } from '../../shared/messages.js';

export async function sendToContentScript(message: PopupToContentMessage): Promise<ContentResponse> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('No active tab found');

  return chrome.tabs.sendMessage(tab.id, message) as Promise<ContentResponse>;
}

export async function sendToBackground(message: RunLLMMessage): Promise<BackgroundResponse> {
  return chrome.runtime.sendMessage(message) as Promise<BackgroundResponse>;
}
