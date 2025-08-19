import React from "react";

import styles from "./styles.module.css";

/**
 * A React Server Component that displays a button that loads a target
 * link when clicked.
 */
export default function Button({
  to,
  children,
  target,
  rel,
}: {
  /** the link to load when the button in clicked */
  to: string;
  /** the content inside the button -- i.e., a label */
  children: React.ReactNode;
  /**
   * an optional string to use as the `target` prop of the <a href>
   * wrapping the button
   */
  target?: string;
  /**
   * an optional string to use as the `rel` prop of the <a href>
   * wrapping the button
   */
  rel?: string;
}): React.ReactElement {
  return (
    <a href={to} target={target} rel={rel}>
      <button className={styles.button}>{children}</button>
    </a>
  );
}
