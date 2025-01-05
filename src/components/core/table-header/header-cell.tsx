import { useCallback } from "react";
import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import { TableResizer } from "@/components/ui/table-resizer";
import { SortIcon } from "@/components/ui/sort-icon";
import type { Column } from "@/types/column.types";
import type { useTable } from "@/hooks/use-table-context";
import type { TableCustomComponents } from "@/types/table.types";

interface HeaderCellProps<T extends Record<string, unknown>> {
  tableInstance: ReturnType<typeof useTable<T>>;
  column: Column<T>;
  className?: string;
  width?: number;
  style?: React.CSSProperties;
  components?: TableCustomComponents<T>;
}

export function HeaderCell<T extends Record<string, unknown>>({
  tableInstance,
  column,
  className,
  width,
  style,
}: HeaderCellProps<T>) {
  const styles = tableStyles();
  const {
    state: { sortColumn, sortDirection },
    columnResizeInfo,
    columnResizeDirection,
    handleSort,
    handleColumnResizeStart,
    handleColumnResizeMove,
    handleColumnResizeEnd,
  } = tableInstance;

  const isResizing = columnResizeInfo.isResizingColumn === column.id;
  const isCurrentSortColumn = sortColumn === column.id;

  const handleSortClick = useCallback(() => {
    if (!column.sortable) return;
    handleSort(column);
  }, [column, handleSort]);

  return (
    <div
      data-column-id={String(column.id)}
      className={cn(styles.headerCell(), className, "group relative")}
      style={{
        width: width ? `${width}px` : undefined,
        minWidth: width ? `${width}px` : undefined,
        ...style,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 overflow-hidden flex items-center">
          <span>
            {typeof column.header === "function"
              ? column.header()
              : column.header}
          </span>
          {column.sortable && (
            <button
              onClick={handleSortClick}
              className={styles.sortButton()}
              aria-label={`Sort by ${String(column.header)}`}
              type="button"
            >
              <SortIcon
                direction={isCurrentSortColumn ? sortDirection : undefined}
                active={isCurrentSortColumn}
              />
            </button>
          )}
        </div>

        {isResizing && (
          <TableResizer
            columnId={String(column.id)}
            isResizing={isResizing}
            onResizeStart={handleColumnResizeStart}
            onResizeMove={handleColumnResizeMove}
            onResizeEnd={handleColumnResizeEnd}
            direction={columnResizeDirection}
            isDragging={!!columnResizeInfo.isResizingColumn}
          />
        )}
      </div>
    </div>
  );
}
