import { useCallback, useEffect, useRef, useState } from 'react';

interface VirtualizationConfig {
  rowHeight: number;
  overscan: number;
  scrollingDelay?: number;
  enabled?: boolean;
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
    position: 'absolute';
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
} {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<VirtualizationState>({
    startIndex: 0,
    endIndex: 0,
    visibleItems: 0,
    scrollTop: 0,
  });

  // Treat virtualization as enabled unless explicitly set to false
  const isEnabled = config.enabled !== false;

  const calculateVisibleRange = useCallback(() => {
    const container = containerRef.current;
    if (!container || !isEnabled) return;

    // Get the container's height and scroll position
    const containerHeight = container.clientHeight;
    const scrollTop = container.scrollTop;

    // Calculate the range of visible items
    const visibleItems = Math.ceil(containerHeight / config.rowHeight);
    
    // Calculate start and end indices with overscan
    let startIndex = Math.floor(scrollTop / config.rowHeight);
    startIndex = Math.max(0, startIndex - config.overscan);

    let endIndex = startIndex + visibleItems + 2 * config.overscan;
    endIndex = Math.min(items.length - 1, endIndex);

    // Update state only if indices have changed
    setState(prevState => {
      if (prevState.startIndex !== startIndex || prevState.endIndex !== endIndex) {
        return {
          startIndex,
          endIndex,
          visibleItems,
          scrollTop,
        };
      }
      return prevState;
    });
  }, [isEnabled, config.overscan, config.rowHeight, items.length]);

  // Set up scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isEnabled) return;

    const handleScroll = () => {
      if (config.scrollingDelay) {
        window.requestAnimationFrame(calculateVisibleRange);
      } else {
        calculateVisibleRange();
      }
    };

    // Initial calculation
    calculateVisibleRange();

    // Add scroll listener
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Cleanup
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [calculateVisibleRange, isEnabled, config.scrollingDelay]);

  // Recalculate on items or config change
  useEffect(() => {
    calculateVisibleRange();
  }, [calculateVisibleRange, items, config.rowHeight]);

  // Generate virtual items
  const virtualItems = useCallback((): VirtualItem<T>[] => {
    if (!isEnabled) {
      return items.map((item, index) => ({
        item,
        index,
        style: {
          position: 'absolute',
          top: index * config.rowHeight,
          width: '100%',
          height: config.rowHeight,
        },
      }));
    }

    return items
      .slice(state.startIndex, state.endIndex + 1)
      .map((item, index) => ({
        item,
        index: state.startIndex + index,
        style: {
          position: 'absolute',
          top: (state.startIndex + index) * config.rowHeight,
          width: '100%',
          height: config.rowHeight,
        },
      }));
  }, [isEnabled, config.rowHeight, items, state.startIndex, state.endIndex]);

  return {
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    virtualItems: virtualItems(),
    totalHeight: items.length * config.rowHeight,
  };
}