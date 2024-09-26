import React from "react";

import styles from "./styles.module.css";

export default function FocusParagraphNarrow({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <p className={styles.focus}>{children}</p>;
}
