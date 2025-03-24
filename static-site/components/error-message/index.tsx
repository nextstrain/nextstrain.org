import React from "react";

import styles from "./styles.module.css";

/**
 * A React Server Component that displays an error message, intended
 * to be used near the top of a page.
 */
export default function ErrorMessage({
  title,
  contents,
}: {
  title: string;
  contents: string;
}): React.ReactElement {
  return (
    <div className={styles.errorMessage}>
      <span className={styles.strongerText}>{title}</span>
      <br />
      Please <a href="/contact">contact us</a> if you believe this to be an
      error.
      <p>{contents}</p>
    </div>
  );
}
