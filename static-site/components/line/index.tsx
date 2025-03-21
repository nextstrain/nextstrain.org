import React from "react";

import styles from "./styles.module.css";

/** A React Server Component that renders a div styled to provide a horizontal rule */
export default function Line (): React.ReactElement {
  return <div className={styles.line}></div>
}

