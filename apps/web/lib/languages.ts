export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (Default)', flag: '🇬🇧' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' }
];

export const DEFAULT_LANGUAGE = 'en';

// Helper function to use later in your user-facing UI navigation
export const isSupportedLanguage = (code: string) => {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
};