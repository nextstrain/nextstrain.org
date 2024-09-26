import { ReactElement, ReactNode } from "react";

import styles from "./styles.module.css";

export default function FocusParagraphNarrow({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <p className={styles.focus}>{children}</p>;
}
