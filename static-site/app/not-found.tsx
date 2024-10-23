import React from "react";

import Splash from "../components/splash";

import styles from "./styles/not-found.module.css";

export default function FourOhFour(): React.ReactElement {
  return (
    <>
      <div className={styles.errorContainer}>
        Oops - that page doesn’t exist! (404).
        <br />
        Here’s the splash page instead…
      </div>

      <Splash />
    </>
  );
}
