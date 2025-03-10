import React from "react";

/**
 * React Server Component that wraps provided `children` (a ReactNode)
 * in a div that displays the provided `description` via the
 * `react-tooltip` libary.
 *
 * Note that the <Tooltip> component must be included somewhere in the
 * rendered React output in order for this wrapper element to cause a
 * tooltip to appear.
 *
 * @param description - a string containing HTML, to display as the tooltip
 * @param children - the content that the tooltip applies to
 */
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
