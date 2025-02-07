import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import { TableRow } from "@/components/core/table-row/table-row";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { useTableGrid } from "@/hooks/use-table-grid";
import { useVirtualization } from "@/hooks/use-virtualization";

interface VirtualizationConfig {
  enabled: boolean;
  rowHeight: number;
  overscan: number;
  scrollingDelay?: number;
  onEndReached?: () => void;
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

export function VirtualizedBody<T extends Record<string, unknown>>({
  className,
  bodyRowClassName,
  bodyCellClassName,
  style,
  config,
  tableInstance,
  customRender,
  components,
}: VirtualizedBodyProps<T>) {
  const styles = tableStyles();
  const {
    filteredData,
    state: { loading },
  } = tableInstance;
  const { containerRef, virtualItems, totalHeight } = useVirtualization(
    filteredData,
    config
  );

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
          "rtg-loading flex items-center justify-center p-8",
          className
        )}
        style={style}
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
        "rtg-table-virtualized-body",
        "relative overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
        "overscroll-none",
        className
      )}
      style={{
        height: style?.height || "520px",
        ...style,
        overscrollBehavior: "contain",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        className={cn(
          "rtg-table-body relative will-change-transform",
          styles.body()
        )}
        style={{
          height: totalHeight,
          contain: "strict",
          contentVisibility: "auto",
        }}
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
          />
        ))}
      </div>
    </div>
  );
}
