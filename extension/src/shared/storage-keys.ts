export interface DataProfile {
  id: string;
  name: string;
  data: string;
}

export interface ExtensionStorage {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
  profiles: DataProfile[];
  selectedProfileIds: string[];
}

export const STORAGE_DEFAULTS: ExtensionStorage = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-4o-mini',
  profiles: [],
  selectedProfileIds: [],
};

export const STORAGE_KEY = 'ai-form-filler-settings';
