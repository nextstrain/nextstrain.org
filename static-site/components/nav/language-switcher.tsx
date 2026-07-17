"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "../../app/i18n/client";
import { cookieName } from "../../app/i18n/settings";
import styles from "./language-switcher.module.css";

export default function LanguageSwitcher(): React.ReactElement {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState<string>("en");

  useEffect(() => {
    if (i18n?.language) {
      setLang(i18n.language);
    }
  }, [i18n?.language]);

  const switchLanguage = (newLang: string) => {
    if (newLang === lang) return;
    
    // Set the language cookie
    document.cookie = `${cookieName}=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
    
    // Change language in i18next
    i18n.changeLanguage(newLang).then(() => {
      // Reload the page to refresh Server Components with the new locale
      window.location.reload();
    });
  };

  return (
    <div className={styles.container}>
      <button
        onClick={() => switchLanguage("en")}
        className={`${styles.button} ${lang === "en" ? styles.active : ""}`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className={styles.divider}>|</span>
      <button
        onClick={() => switchLanguage("fr")}
        className={`${styles.button} ${lang === "fr" ? styles.active : ""}`}
        aria-label="Switch to French"
      >
        FR
      </button>
    </div>
  );
}
