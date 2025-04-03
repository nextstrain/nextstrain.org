import React from "react";

import styles from "./styles.module.css";

/** A React Server Component that renders its children inside a paragraph */
export function FocusParagraph({
  children,
}: {
  /** the child nodes to render in the paragraph */
  children: React.ReactNode;
}): React.ReactElement {
  return <p className={`${styles.focus}`}>{children}</p>;
}

/** A React Server Component that renders its children inside a centered paragraph */
export function FocusParagraphCentered({
  children,
}: {
  /** the child nodes to render in the paragraph */
  children: React.ReactNode;
}): React.ReactElement {
  return <p className={`${styles.focus} ${styles.centered}`}>{children}</p>;
}

/**
 * A React Server Component that renders its children inside a
 * paragraph that is slightly narrower than the default
 */
export function FocusParagraphNarrow({
  children,
}: {
  /** the child nodes to render in the paragraph */
  children: React.ReactNode;
}): React.ReactElement {
  return <p className={`${styles.focus} ${styles.narrow}`}>{children}</p>;
}
