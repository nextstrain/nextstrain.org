"use client";

import React, { useState } from "react";

import { IconType } from "react-icons";
import { MdFormatListBulleted, MdHistory, MdOutlineWarningAmber } from "react-icons/md";

import { InternalError } from "../error-boundary";

import styles from "./icon-container.module.css";

/**
 * React Client Component that renders the icon for the provided
 * `iconName` inside a styled `<div>`.
 *
 * Currently supports `"history"` and `"bullet-list"` as `iconName`
 * values; if provided with something else, will throw an
 * `InternalError`
 */
export default function IconContainer({
  color,
  handleClick,
  hoverColor,
  iconName,
  text,
}: {
  /** string value for CSS `color` */
  color?: string;

  /** callback for `onClick` handler */
  handleClick?: () => void;

  /** string value for CSS `color` when element is hovered over */
  hoverColor?: string;

  /** name of icon to display */
  iconName: string;

  /** text to display below icon */
  text: string;
}): React.ReactElement {
  const [hovered, setHovered] = useState(false);

  const defaultColor = "#aaa";
  const defaultHoverColor = "rgb(79, 75, 80)";
  const hasOnClick = typeof handleClick === "function";

  const col = hovered ? hoverColor || defaultHoverColor : color || defaultColor;
  const cursor = hasOnClick ? "pointer" : "auto";
  const iconProps = { size: "1.2em", color: col };

  let Icon: IconType;
  switch (iconName) {
    case "history":
      Icon = MdHistory;
      break;
    case "bullet-list":
      Icon = MdFormatListBulleted;
      break;
    case "out-of-date":
      Icon = MdOutlineWarningAmber;
      break;
    default:
      throw new InternalError(`${iconName} is not a valid icon name`);
  }

  return (
    <div
      className={styles.iconWrapper}
      onClick={hasOnClick ? handleClick : undefined}
      onMouseOut={() => setHovered(false)}
      onMouseOver={() => setHovered(true)}
      style={{
        color: col,
        cursor,
      }}
    >
      <Icon {...iconProps} />
      {text}
    </div>
  );
}
