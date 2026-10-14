import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import uzTranslation from "./locales/uz/translation.json";
import ruTranslation from "./locales/ru/translation.json";
import enTranslation from "./locales/en/translation.json";

export const SUPPORTED_LANGUAGES = [
  { code: "uz", name: "O'zbekcha", short: "UZ" },
  { code: "ru", name: "Русский", short: "RU" },
  { code: "en", name: "English", short: "EN" },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]["code"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uzTranslation },
      ru: { translation: ruTranslation },
      en: { translation: enTranslation },
    },
    fallbackLng: "uz",
    supportedLngs: ["uz", "ru", "en"],
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
    },
  });

export default i18n;
