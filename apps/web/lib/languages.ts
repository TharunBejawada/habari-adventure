// lib/languages.ts
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (Default)', countryCode: 'gb' }, // 'gb' for UK flag
  { code: 'fr', name: 'French', countryCode: 'fr' },
  { code: 'es', name: 'Spanish', countryCode: 'es' }
];

export const DEFAULT_LANGUAGE = 'en';

export const isSupportedLanguage = (code: string) => {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
};