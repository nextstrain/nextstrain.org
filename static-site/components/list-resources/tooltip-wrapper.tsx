import React from "react";

export default function TooltipWrapper({
  description,
  children,
}: {
  description: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      data-tooltip-id="listResourcesTooltip"
      data-tooltip-html={description}
      data-tooltip-place="top"
    >
      {children}
    </div>
  );
}
