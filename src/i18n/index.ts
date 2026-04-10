import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en";
import uk from "./uk";

export const LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "uk", label: "Ukrainian", nativeLabel: "Українська" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    uk: { translation: uk },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  compatibilityJSON: "v4",
});

export default i18n;
