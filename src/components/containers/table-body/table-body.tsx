import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import { TableRow } from "@/components/core/table-row/table-row";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Empty } from "@/components/ui/empty";
import type { useTableGrid } from "@/hooks/use-table-grid";
// import "./table-body.css";

interface TableBodyProps<T extends Record<string, unknown>> {
  className?: string;
  style?: React.CSSProperties;
  bodyRowClassName?: string;
  bodyCellClassName?: string;
  tableInstance: ReturnType<typeof useTableGrid<T>>;
  components?: {
    EmptyState?: React.ComponentType;
    LoadingState?: React.ComponentType;
  };

  customRender?: {
    empty?: () => React.ReactNode;
    loading?: () => React.ReactNode;
    row?: (props: { row: T; rowIndex: number }) => React.ReactNode;
  };
  withoutTailwind?: boolean;
}

export function TableBody<T extends Record<string, unknown>>({
  className,
  style,
  tableInstance,
  components,
  customRender,
  bodyRowClassName,
  bodyCellClassName,
  withoutTailwind = false,
}: TableBodyProps<T>) {
  const styles = tableStyles();
  const {
    filteredData,
    state: { loading },
  } = tableInstance;

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
            ? "rtg-body-loading"
            : cn("rtg-loading flex items-center justify-center p-8", className),
          className
        )}
        style={style}
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <div className={withoutTailwind ? "rtg-loading-spinner" : undefined}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (filteredData.length === 0) {
    if (customRender?.empty) {
      return customRender.empty();
    }

    if (components?.EmptyState) {
      return <components.EmptyState />;
    }

    return (
      <div
        className={cn(
          withoutTailwind 
            ? "rtg-body-empty"
            : cn("flex items-center justify-center p-8", className),
          className
        )}
        style={style}
        role="status"
        aria-label="No data available"
      >
        <Empty text="No data found" />
      </div>
    );
  }

  const RowComponent = customRender?.row || TableRow;

  return (
    <div
      className={cn(
        withoutTailwind 
          ? "rtg-body"
          : cn("rtg-table-body", styles.body()),
        className
      )}
      style={style}
      role="rowgroup"
      aria-label="Table body"
    >
      {filteredData.map((row: T, index: number) => (
        <RowComponent
          key={`row-${index}-${(row as { id?: string }).id || ""}`}
          row={row}
          rowIndex={index}
          tableInstance={tableInstance}
          className={cn(
            withoutTailwind ? "rtg-body-row" : undefined,
            bodyRowClassName
          )}
          cellClassName={bodyCellClassName}
          withoutTailwind={withoutTailwind}
        />
      ))}
    </div>
  );
}
