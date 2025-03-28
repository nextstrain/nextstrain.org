import React from "react";

import { FaAngleUp, FaAngleDown } from "react-icons/fa";

import styles from "./collapse-title.module.css";

export default function CollapseTitle({
  name,
  isExpanded = false,
}: {
  name: string;
  isExpanded?: boolean;
}): React.ReactElement {
  return (
    <div className={styles.titleContainer}>
      <span className={styles.name}>{name}</span>
      <span className={styles.iconContainer}>
        {isExpanded ? <FaAngleUp /> : <FaAngleDown />}
      </span>
    </div>
  );
}
