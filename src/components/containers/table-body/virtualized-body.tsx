import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import { TableRow } from "@/components/core/table-row/table-row";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { useTableGrid } from "@/hooks/use-table-grid";
import { useVirtualization } from "@/hooks/use-virtualization";
import { useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
// import "./virtualized-body.css";

interface VirtualizationConfig {
  enabled: boolean;
  rowHeight: number;
  overscan: number;
  scrollingDelay?: number;
  onEndReached?: () => void;
  getRowHeight?: (index: number) => number;
}

interface VirtualizedBodyProps<T extends Record<string, unknown>> {
  className?: string;
  bodyRowClassName?: string;
  bodyCellClassName?: string;
  style?: React.CSSProperties;
  config: VirtualizationConfig;
  tableInstance: ReturnType<typeof useTableGrid<T>>;

  customRender?: {
    row?: typeof TableRow;
    loading?: () => React.ReactNode;
  };
  components?: {
    LoadingState?: React.ComponentType;
  };
}

export interface VirtualizedBodyHandle {
  scrollTo: (index: number) => void;
}

export const VirtualizedBody = forwardRef(function VirtualizedBody<
  T extends Record<string, unknown>
>(
  props: VirtualizedBodyProps<T> & { withoutTailwind?: boolean },
  ref: React.ForwardedRef<VirtualizedBodyHandle>
) {
  const {
    className,
    bodyRowClassName,
    bodyCellClassName,
    style,
    config,
    tableInstance,
    customRender,
    components,
    withoutTailwind = false,
  } = props;

  const styles = tableStyles();
  const {
    filteredData,
    state: { loading },
  } = tableInstance;

  const { containerRef, virtualItems, totalHeight } = useVirtualization(
    filteredData,
    {
      ...config,
      getRowHeight: config.getRowHeight,
    }
  );

  // Expose scrollTo method
  useImperativeHandle(ref, () => ({
    scrollTo: (index: number) => {
      if (!containerRef.current) return;
      const rowHeight = config.rowHeight;
      const scrollTop = index * rowHeight;
      containerRef.current.scrollTop = scrollTop;
    }
  }), [config.rowHeight]);

  // Handle scroll to end for infinite loading
  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    if (!config.onEndReached) return;

    const scrolledToBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 100;

    if (scrolledToBottom && !loading) {
      config.onEndReached();
    }
  }, [config.onEndReached, loading]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !config.onEndReached) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll, config.onEndReached]);

  // Handle loading state
  if (loading) {
    if (customRender?.loading) {
      return customRender.loading();
    }

    if (components?.LoadingState) {
      return <components.LoadingState />;
    }

    return (
      <div
        className={cn(
          withoutTailwind
            ? "rtg-virtualized-loading"
            : "rtg-loading flex items-center justify-center p-8",
          className
        )}
        style={style}
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <LoadingSpinner />
      </div>
    );
  }

  const RowComponent = customRender?.row || TableRow;

  return (
    <div
      ref={containerRef}
      className={cn(
        withoutTailwind
          ? "rtg-virtualized-body"
          : [
              "rtg-table-virtualized-body",
              "relative overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
              "overscroll-none",
            ],
        className
      )}
      style={{
        height: style?.height || "520px",
        ...style,
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
      }}
      role="rowgroup"
      aria-label="Virtualized table body"
    >
      <div
        className={cn(
          withoutTailwind
            ? "rtg-virtualized-content"
            : cn(
                "rtg-table-body relative will-change-transform",
                styles.body()
              )
        )}
        style={{
          height: totalHeight,
          contain: "strict",
          contentVisibility: "auto",
        }}
        role="presentation"
      >
        {virtualItems.map((virtualItem) => (
          <RowComponent
            key={`row-${virtualItem.index}-${
              (virtualItem.item as { id?: string }).id || virtualItem.index
            }`}
            row={virtualItem.item}
            rowIndex={virtualItem.index}
            isVirtual
            virtualStyle={virtualItem.style}
            tableInstance={tableInstance}
            className={bodyRowClassName}
            cellClassName={bodyCellClassName}
            withoutTailwind={withoutTailwind}
          />
        ))}
      </div>
    </div>
  );
}) as <T extends Record<string, unknown>>(
  props: VirtualizedBodyProps<T> & {
    ref?: React.ForwardedRef<VirtualizedBodyHandle>;
    withoutTailwind?: boolean;
  }
) => React.ReactElement;
