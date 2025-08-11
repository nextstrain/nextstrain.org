import React from "react";

import styles from "./styles.module.css";

/**
 * A React Server Component that formats its child nodes as a
 * flex div
 */
export function FlexGrid({
  children,
  style,
}: {
  /** The content to display within the grid */
  children: React.ReactNode;
  /** An optional set of CSS properties to give to the `style` prop of the div */
  style?: React.CSSProperties;
}): React.ReactElement {
  return (
    <div className={styles.flexGrid} style={style}>
      {children}
    </div>
  );
}

/**
 * A React Server Component that formats its child nodes as a flex-div
 * on the right
 */
export function FlexGridRight({
  children,
  style,
}: {
  /** the child nodes to render in the flex-div */
  children: React.ReactNode;
  /** An optional set of CSS properties to give to the `style` prop of the div */
  style?: React.CSSProperties;
}): React.ReactElement {
  return (
    <div className={styles.flexGridRight} style={style}>
      {children}
    </div>
  );
}
