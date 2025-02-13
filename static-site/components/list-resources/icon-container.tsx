"use client";

import React, { useState } from "react";

import { IconType } from "react-icons";
import { MdFormatListBulleted, MdHistory } from "react-icons/md";

import { InternalError } from "../error-boundary";

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

  const style = {
    alignItems: "center",
    color: col,
    cursor,
    display: "flex",
    gap: "3px",
  };

  return (
    <div
      onClick={hasOnClick ? handleClick : undefined}
      onMouseOut={() => setHovered(false)}
      onMouseOver={() => setHovered(true)}
      style={style}
    >
      <Icon {...iconProps} />
      {text}
    </div>
  );
}
