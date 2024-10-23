import React from "react";

import styles from "./styles/not-found.module.css";

export default function FourOhFour(): React.ReactElement {
  return (
    <>
      <div className={styles.errorContainer}>
        Oops - that page doesn’t exist! (404).
        <br />
        Maybe start again with <a href="/">our main page</a>?
      </div>
    </>
  );
}
