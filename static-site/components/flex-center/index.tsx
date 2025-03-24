import React from "react";

import styles from "./styles.module.css";

/** A React Server Component that formats its child nodes as a centered flex-div */
export default function FlexCenter({
  children,
}: {
  /** the child nodes to render in the flex-div */
  children: React.ReactNode;
}): React.ReactElement {
  return <div className={styles.flexCenter}>{children}</div>;
}
