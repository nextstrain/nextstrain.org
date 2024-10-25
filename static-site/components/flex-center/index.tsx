import React from "react";

import styles from "./styles.module.css";

export default function FlexCenter({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <div className={styles.flexCenter}>{children}</div>;
}
