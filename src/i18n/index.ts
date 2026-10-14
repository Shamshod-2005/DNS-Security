import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import uzTranslation from "./locales/uz/translation.json";
import ruTranslation from "./locales/ru/translation.json";
import enTranslation from "./locales/en/translation.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", short: "EN" },
  { code: "uz", name: "O'zbekcha", short: "UZ" },
  { code: "ru", name: "Русский", short: "RU" },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      uz: { translation: uzTranslation },
      ru: { translation: ruTranslation },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "uz", "ru"],
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["localStorage"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;
