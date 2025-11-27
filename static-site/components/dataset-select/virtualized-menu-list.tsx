"use client";

/**
 * Code and components related to the virtualized menu list to be used
 * with react-select. Most code and logic was originally lifted from
 * Auspice, with the addition of the AutoSizer to make the menu list
 * width dynamic.
 */
import React, { useLayoutEffect, useRef } from "react";

import { isEqual } from "lodash";
import { AutoSizer } from "react-virtualized/dist/es/AutoSizer";
import {
  CellMeasurer,
  CellMeasurerCache,
  MeasuredCellParent,
} from "react-virtualized/dist/es/CellMeasurer";
import { List } from "react-virtualized/dist/es/List";

/** The default height for a row in the menu list, in pixels */
const DEFAULT_ROW_HEIGHT = 40;

/**
 * Helper function to return the `key` value from a list of objects,
 * which must all have a `key` property
 */
function getOptionKeys(
  /** the list of objects to process */
  options: { key: string }[],
): string[] {
  return options.map((option) => option.key);
}

/**
 * A React Client Component to display a list of options, with one focused
 */
export default function VirtualizedMenuList({
  children,
  maxHeight,
  focusedOption,
}: {
  // FIXME figure out what these are?
  /** the menu items */
  children: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  /** maximum height of the menu, in pixels */
  maxHeight: number;

  // FIXME pretty sure this is a single element of `children`
  /** which option to focus */
  focusedOption: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}): React.ReactElement {
  const listRef = useRef<List>(null);

  const optionKeys = useRef<string[]>([]);

  const cache = useRef<FullCellMeasurerCache>(
    /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions */
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: DEFAULT_ROW_HEIGHT,
    }) as FullCellMeasurerCache,
  );

  /**
   * If the focused option is outside of the currently displayed options, we
   * need to create the scrollToIndex so that the List can be forced to scroll
   * to display the focused option.
   */
  let scrollToIndex: number;

  if (children instanceof Array) {
    const focusedOptionIndex = children.findIndex((option) =>
      isEqual(focusedOption, option.props.data),
    );
    if (focusedOptionIndex >= 0) {
      scrollToIndex = focusedOptionIndex;
    }
  }

  /**
   * When the children options have changed, the cache has to be manually cleared
   * and the list has to recompute the row heights to correctly display the
   * new options.
   * See answer from react-virtualized maintainer @bvaughn at
   * https://stackoverflow.com/a/43837929
   */
  useLayoutEffect((): void => {
    if (
      children instanceof Array &&
      listRef.current !== null &&
      !isEqual(optionKeys.current, getOptionKeys(children))
    ) {
      cache.current.clearAll();
      listRef.current.recomputeRowHeights();
      optionKeys.current = getOptionKeys(children);
    }
  }, [children]);

  /**
   * Wraps each option in a CellMeasurer which measures the row height based
   * on the contents of the option and passes this height to the parent List
   * component via the cache
   *
   * Note that react-virtualized uses findDOMNode which is deprecated in
   * StrictMode, which we avoid by using the `registerChild` ref. See
   * <https://github.com/bvaughn/react-virtualized/issues/1572>
   */
  function rowRenderer({
    index,
    key,
    parent,
    style,
  }: {
    /** the index of the row being rendered */
    index: number;

    /** unique key */
    key: string;

    /** parent of the row being rendered */
    parent: MeasuredCellParent;

    /** style string for the row */
    style: React.CSSProperties;
  }): React.ReactElement {
    return (
      <CellMeasurer
        cache={cache.current}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        {({ registerChild }) => (
          <div ref={registerChild} style={style}>
            {children[index]}
          </div>
        )}
      </CellMeasurer>
    );
  }

  /**
   * Because the individual row heights are measured and cached on render,
   * this is just a best guess of the list height.
   * There can be a delay in the list height changing if there is a rapid
   * change of the children options.
   */
  function calcListHeight(): number {
    const currentRowHeights: number[] = Object.values(
      cache.current._rowHeightCache,
    );
    const totalRowHeight = currentRowHeights.reduce(
      (a: number, b: number) => a + b,
      0,
    );
    return totalRowHeight === 0
      ? maxHeight
      : Math.min(maxHeight, totalRowHeight);
  }

  return (
    <AutoSizer disableHeight>
      {({ width }: { width: number }) => (
        <List
          ref={listRef}
          height={calcListHeight()}
          deferredMeasurementCache={cache.current}
          rowHeight={cache.current.rowHeight}
          rowRenderer={rowRenderer}
          rowCount={children.length || 0}
          width={width}
          scrollToIndex={scrollToIndex}
        />
      )}
    </AutoSizer>
  );
}

// _rowHeightCache is not annotated in @types/react-virtualized
type FullCellMeasurerCache = CellMeasurerCache & {
  _rowHeightCache: {
    [key: number]: number;
  };
};
