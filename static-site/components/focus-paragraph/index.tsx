import React from "react";

import styles from "./styles.module.css";

export function FocusParagraphCentered({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <p className={`${styles.focus} ${styles.centered}`}>{children}</p>;
}

export function FocusParagraphNarrow({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <p className={`${styles.focus} ${styles.narrow}`}>{children}</p>;
}
