import React from "react";

const DEFAULT_HEIGHTS = {
  small: 5,
  medium: 10,
  big: 20,
  huge: 40,
};

function Spacer({
  count,
  height,
}: {
  count?: number;
  height: number;
}): React.ReactElement {
  if (!count) {
    count = 1;
  }

  return <div style={{ height: count * height }}></div>;
}

export function SmallSpacer({ count }: { count?: number }): React.ReactElement {
  return <Spacer count={count} height={DEFAULT_HEIGHTS["small"]} />;
}

export function MediumSpacer({ count }: { count?: number }): React.ReactElement {
  return <Spacer count={count} height={DEFAULT_HEIGHTS["medium"]} />;
}

export function BigSpacer({ count }: { count?: number }): React.ReactElement {
  return <Spacer count={count} height={DEFAULT_HEIGHTS["big"]} />;
}
export function HugeSpacer({ count }: { count?: number }): React.ReactElement {
  return <Spacer count={count} height={DEFAULT_HEIGHTS["huge"]} />;
}
