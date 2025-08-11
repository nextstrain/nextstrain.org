import React from "react";

import styles from "./styles.module.css";

/** A React Server Component that renders its children inside a paragraph */
export function FocusParagraph({
  children,
  style,
}: {
  /** the child nodes to render in the paragraph */
  children: React.ReactNode;
  /** extra CSS style properties to apply */
  style?: React.CSSProperties;
}): React.ReactElement {
  return (
    <p className={`${styles.focus}`} style={style}>
      {children}
    </p>
  );
}

/** A React Server Component that renders its children inside a centered paragraph */
export function FocusParagraphCentered({
  children,
  style,
}: {
  /** the child nodes to render in the paragraph */
  children: React.ReactNode;
  /** extra CSS style properties to apply */
  style?: React.CSSProperties;
}): React.ReactElement {
  return (
    <p className={`${styles.focus} ${styles.centered}`} style={style}>
      {children}
    </p>
  );
}

/**
 * A React Server Component that renders its children inside a
 * paragraph that is slightly narrower than the default
 */
export function FocusParagraphNarrow({
  children,
  style,
}: {
  /** the child nodes to render in the paragraph */
  children: React.ReactNode;
  /** extra CSS style properties to apply */
  style?: React.CSSProperties;
}): React.ReactElement {
  return (
    <p className={`${styles.focus} ${styles.narrow}`} style={style}>
      {children}
    </p>
  );
}
