import React from "react";

const DEFAULT_HEIGHTS = {
  small: 5,
  medium: 10,
  big: 20,
  huge: 40,
};

/**
 * React Server Component that renders a spacer div with a particular height
 *
 * Note that this is an internal, non-exported helper to keep the
 * actually exported components DRY
 */
function Spacer({
  count,
  height,
}: {
  /** how many spacers? (optional, defaults to 1) */
  count?: number;

  /** height of an individual spacer */
  height: number;
}): React.ReactElement {
  if (!count) {
    count = 1;
  }

  return <div style={{ height: count * height }}></div>;
}

/** React Server Component for a small spacer */
export function SmallSpacer({
  count,
}: {
  /** (optional) number of spacers to return, default 1 */
  count?: number;
}): React.ReactElement {
  return <Spacer count={count} height={DEFAULT_HEIGHTS["small"]} />;
}

/** React Server Component for a medium spacer */
export function MediumSpacer({
  count,
}: {
  /** (optional) number of spacers to return, default 1 */
  count?: number;
}): React.ReactElement {
  return <Spacer count={count} height={DEFAULT_HEIGHTS["medium"]} />;
}

/** React Server Component for a big spacer */
export function BigSpacer({
  count,
}: {
  /** (optional) number of spacers to return, default 1 */ count?: number;
}): React.ReactElement {
  return <Spacer count={count} height={DEFAULT_HEIGHTS["big"]} />;
}

/** React Server Component for a HUGE spacer */
export function HugeSpacer({
  count,
}: {
  /** (optional) number of spacers to return, default 1 */
  count?: number;
}): React.ReactElement {
  return <Spacer count={count} height={DEFAULT_HEIGHTS["huge"]} />;
}
