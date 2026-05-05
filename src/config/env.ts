import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'cannavigator_api_base_url';
const DEFAULT_BASE_URL = 'https://cn-api.prijslijstapp.nl/api/v1';

let cachedUrl: string | null = null;

export async function getApiBaseUrl(): Promise<string> {
  if (cachedUrl) return cachedUrl;
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  cachedUrl = stored || DEFAULT_BASE_URL;
  return cachedUrl;
}

export async function setApiBaseUrl(url: string): Promise<void> {
  cachedUrl = url;
  await AsyncStorage.setItem(STORAGE_KEY, url);
}

export function getDefaultBaseUrl(): string {
  return DEFAULT_BASE_URL;
}
