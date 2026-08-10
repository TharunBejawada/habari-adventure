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

// The default language has no URL prefix (e.g. "/about", not "/en/about"),
// while every other language keeps its "/fr", "/es", etc. prefix.
export const getLangPrefix = (code: string) => {
  return code === DEFAULT_LANGUAGE ? '' : `/${code}`;
};