import { ReactElement, ReactNode } from "react";

import styles from "./styles.module.css";

export default function FlexCenter({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <div className={styles.flexCenter}>{children}</div>;
}
