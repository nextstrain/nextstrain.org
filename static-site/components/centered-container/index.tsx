import React from "react";

import styles from "./styles.module.css";

/** A React Server Component that renders children in a centered div */
export default function CenteredContainer({
  children,
}: {
  /** The childern to render */
  children: React.ReactNode;
}): React.ReactElement {
  return <div className={styles.centeredContainer}>{children}</div>;
}
