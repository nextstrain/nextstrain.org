"use client";

import i18next from "i18next";
import { initReactI18next, useTranslation as useTranslationOrg } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { getOptions, cookieName, fallbackLng } from "./settings";

const getCookie = (name: string): string | undefined => {
  if (typeof window === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
};

// Initialize i18next for the client
if (!i18next.isInitialized) {
  const clientLang = getCookie(cookieName) || fallbackLng;
  i18next
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`../../public/locales/${language}/${namespace}.json`)
      )
    )
    .init({
      ...getOptions(clientLang),
    });
}

export function useTranslation(ns?: string | string[], options?: any) {
  return useTranslationOrg(ns, options);
}
export { i18next as i18n };
