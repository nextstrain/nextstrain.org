/**
 * Code and components related to the virtualized menu list to be used with react-select.
 * Most code and logic was originally lifted from Auspice, with the addition of
 * the AutoSizer to make the menu list width dynamic.
 */
import React, { useLayoutEffect, useRef } from "react";
import { isEqual } from "lodash";
import { AutoSizer } from "react-virtualized/dist/es/AutoSizer";
import { List } from "react-virtualized/dist/es/List";
import { CellMeasurer, CellMeasurerCache } from "react-virtualized/dist/es/CellMeasurer";

const DEFAULT_ROW_HEIGHT = 40;
const getOptionKeys = (options) => options.map((option) => option.key);

export const VirtualizedMenuList = ({ children, maxHeight, focusedOption }) => {
  const listRef = useRef(null);
  const optionKeys = useRef(null);
  const cache = useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: DEFAULT_ROW_HEIGHT
    })
  );

  /**
  * If the focused option is outside of the currently displayed options, we
  * need to create the scrollToIndex so that the List can be forced to scroll
  * to display the focused option.
  */
  let scrollToIndex;
  if (children instanceof Array) {
    const focusedOptionIndex = children.findIndex((option) => (
      isEqual(focusedOption, option.props.data)
    ));
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
  useLayoutEffect(() => {
    if (children instanceof Array &&
        !isEqual(optionKeys.current, getOptionKeys(children))) {
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
  const rowRenderer = ({ index, key, parent, style }) => (
    <CellMeasurer
      cache={cache.current}
      columnIndex={0}
      key={key}
      parent={parent}
      rowIndex={index}
    >
      {({registerChild}) => (
        <div ref={registerChild} style={style}>
          {children[index]}
        </div>
      )}
    </CellMeasurer>
  );

  /**
   * Because the individual row heights are measured and cached on render,
   * this is just a best guess of the list height.
   * There can be a delay in the list height changing if there is a rapid
   * change of the children options.
   */
  const calcListHeight = () => {
    const currentRowHeights = Object.values(cache.current._rowHeightCache);
    const totalRowHeight = currentRowHeights.reduce((a, b) => a + b, 0);
    return totalRowHeight === 0 ? maxHeight : Math.min(maxHeight, totalRowHeight);
  };

  return (
    <AutoSizer disableHeight >
      {({ width }) => (
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
};
