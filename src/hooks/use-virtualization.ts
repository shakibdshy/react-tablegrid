import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { throttle } from "lodash";

interface VirtualizationConfig {
  rowHeight: number;
  overscan: number;
  scrollingDelay?: number;
  enabled?: boolean;
  getRowHeight?: (index: number) => number;
}

interface VirtualizationState {
  startIndex: number;
  endIndex: number;
  visibleItems: number;
  scrollTop: number;
}

interface VirtualItem<T> {
  item: T;
  index: number;
  style: {
    position: "absolute";
    top: number;
    width: string;
    height: number;
  };
}

export function useVirtualization<T>(
  items: T[],
  config: VirtualizationConfig
): {
  containerRef: React.RefObject<HTMLDivElement>;
  virtualItems: VirtualItem<T>[];
  totalHeight: number;
  scrollTo: (index: number) => void;
} {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<VirtualizationState>({
    startIndex: 0,
    endIndex: 0,
    visibleItems: 0,
    scrollTop: 0,
  });

  const isEnabled = config.enabled !== false;

  const getItemHeight = useCallback(
    (index: number): number => {
      return config.getRowHeight ? config.getRowHeight(index) : config.rowHeight;
    },
    [config.getRowHeight, config.rowHeight]
  );

  const totalHeight = useMemo(() => {
    if (config.getRowHeight) {
      return items.reduce((sum: number, _, index) => sum + getItemHeight(index), 0);
    }
    return items.length * config.rowHeight;
  }, [items.length, config.rowHeight, config.getRowHeight, getItemHeight]);

  const getOffsetForIndex = useCallback(
    (index: number): number => {
      if (config.getRowHeight) {
        return Array.from({ length: index }).reduce(
          (sum: number, _, i) => sum + getItemHeight(i),
          0
        );
      }
      return index * config.rowHeight;
    },
    [config.getRowHeight, config.rowHeight, getItemHeight]
  );

  const calculateVisibleRange = useCallback(() => {
    const container = containerRef.current;
    if (!container || !isEnabled) return;

    const containerHeight = container.clientHeight;
    const scrollTop = container.scrollTop;

    let startIndex = 0;
    let currentOffset = 0;

    if (config.getRowHeight) {
      while (currentOffset < scrollTop && startIndex < items.length) {
        currentOffset += getItemHeight(startIndex);
        startIndex++;
      }
      startIndex = Math.max(0, startIndex - config.overscan);
    } else {
      startIndex = Math.max(0, Math.floor(scrollTop / config.rowHeight) - config.overscan);
    }

    let endIndex = startIndex;
    let heightSum = 0;

    while (heightSum < containerHeight + (config.overscan * getItemHeight(endIndex)) && endIndex < items.length) {
      heightSum += getItemHeight(endIndex);
      endIndex++;
    }

    endIndex = Math.min(items.length - 1, endIndex);

    setState((prevState) => {
      if (
        prevState.startIndex !== startIndex ||
        prevState.endIndex !== endIndex
      ) {
        return {
          startIndex,
          endIndex,
          visibleItems: endIndex - startIndex + 1,
          scrollTop,
        };
      }
      return prevState;
    });
  }, [isEnabled, config.overscan, getItemHeight, items.length]);

  const handleScroll = useMemo(
    () =>
      throttle(
        () => {
          if (config.scrollingDelay) {
            window.requestAnimationFrame(calculateVisibleRange);
          } else {
            calculateVisibleRange();
          }
        },
        config.scrollingDelay || 16
      ),
    [calculateVisibleRange, config.scrollingDelay]
  );

  useEffect(() => {
    if (!isEnabled) return;

    const handleResize = throttle(calculateVisibleRange, 16);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      handleResize.cancel();
    };
  }, [calculateVisibleRange, isEnabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isEnabled) return;

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      handleScroll.cancel();
    };
  }, [handleScroll, isEnabled]);

  useEffect(() => {
    calculateVisibleRange();
  }, [calculateVisibleRange, items, config.rowHeight]);

  const virtualItems = useMemo((): VirtualItem<T>[] => {
    if (!isEnabled) {
      return items.map((item, index) => ({
        item,
        index,
        style: {
          position: "absolute",
          top: getOffsetForIndex(index),
          width: "100%",
          height: getItemHeight(index),
        },
      }));
    }

    return items
      .slice(state.startIndex, state.endIndex + 1)
      .map((item, index) => {
        const actualIndex = state.startIndex + index;
        return {
          item,
          index: actualIndex,
          style: {
            position: "absolute",
            top: getOffsetForIndex(actualIndex),
            width: "100%",
            height: getItemHeight(actualIndex),
          },
        };
      });
  }, [
    isEnabled,
    items,
    state.startIndex,
    state.endIndex,
    getOffsetForIndex,
    getItemHeight,
  ]);

  const scrollTo = useCallback(
    (index: number) => {
      if (!containerRef.current) return;
      const top = getOffsetForIndex(index);
      containerRef.current.scrollTop = top;
    },
    [getOffsetForIndex]
  );

  return {
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    virtualItems,
    totalHeight,
    scrollTo,
  };
}
