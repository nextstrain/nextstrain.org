import { ReactElement, ReactNode } from "react";

import styles from "./styles.module.css";

export function FocusParagraphCentered({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <p className={`${styles.focus} ${styles.centered}`}>{children}</p>;
}

export function FocusParagraphNarrow({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <p className={`${styles.focus} ${styles.narrow}`}>{children}</p>;
}
