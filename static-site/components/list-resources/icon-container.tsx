"use client";

import React, { useState } from "react";

import { IconType } from "react-icons";
import { MdFormatListBulleted, MdHistory } from "react-icons/md";

import { InternalError } from "../error-boundary";

import styles from "./icon-container.module.css";

/**
 * React Client Component that renders the icon for the provided
 * `iconName` inside a styled `<div>`.
 *
 * Currently supports `"history"` and `"bullet-list"` as `iconName`
 * values; if provided with something else, will throw an
 * `InternalError`
 *
 * @param color - (optional) string value for CSS `color`
 * @param handleClick - (optional) callback for `onClick` handler
 * @param hoverColor - (optional) string value for CSS `color` when
 * element is hovered over
 * @param iconName - name of icon to display
 * @param text to display below icon
 */
export default function IconContainer({
  color,
  handleClick,
  hoverColor,
  iconName,
  text,
}: {
  color?: string;
  handleClick?: () => void;
  hoverColor?: string;
  iconName: string;
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
