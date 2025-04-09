import React from "react";

import Tooltip, { Place, Type } from "react-tooltip";

import styles from "./styled-tooltip.module.css";

/** A React Server Compoent for displaying a styled tooltip */
export default function StyledTooltip({
  children,
  delayShow = 0,
  id,
  place = "top",
  type = "dark",
}: {
  /** Content wrapped by this tooltip */
  children: React.ReactNode | React.ReactElement;

  /** Milliseconds to delay before tooltip is displayed */
  delayShow?: number;

  /** unique ID, used to map tooltip to content that triggers it */
  id: string;

  /** Tooltip position */
  place?: Place;

  /** Color/style of tooltip */
  type?: Type;
}): React.ReactElement {
  return (
    <Tooltip
      className={styles.styledTooltip}
      delayShow={delayShow}
      effect="solid"
      id={id}
      place={place}
      type={type}
    >
      {children}
    </Tooltip>
  );
}
