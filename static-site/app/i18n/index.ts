import { createInstance } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";
import { cookies, headers } from "next/headers";
import { getOptions, cookieName, fallbackLng } from "./settings";

const initI18next = async (lng: string, ns: string | string[]) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`../../public/locales/${language}/${namespace}.json`)
      )
    )
    .init(getOptions(lng, Array.isArray(ns) ? ns[0] : ns));
  return i18nInstance;
};

export async function useTranslation(ns?: string | string[], options: any = {}) {
  let lng = fallbackLng;

  try {
    const cookieStore = cookies();
    const langCookie = cookieStore.get(cookieName)?.value;
    if (langCookie) {
      lng = langCookie;
    } else {
      const headersList = headers();
      const acceptLang = headersList.get("accept-language");
      if (acceptLang?.startsWith("fr")) {
        lng = "fr";
      }
    }
  } catch (e) {
    // cookies() / headers() might throw in environments like static generation
  }

  const i18nInstance = await initI18next(lng, ns || "common");
  return {
    t: i18nInstance.getFixedT(lng, ns || "common", options.keyPrefix),
    i18n: i18nInstance,
  };
}
