import { useCallback, memo } from "react";
import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import { TableResizer } from "@/components/ui/table-resizer";
import { SortIcon } from "@/components/ui/sort-icon";
import type { Column } from "@/types/column.types";
import type { useTableGrid } from "@/hooks/use-table-grid";
import type { TableCustomComponents } from "@/types/table.types";

interface TableColumnProps<T extends Record<string, unknown>> {
  tableInstance: ReturnType<typeof useTableGrid<T>>;
  column: Column<T>;
  className?: string;
  width?: number;
  style?: React.CSSProperties;
  components?: TableCustomComponents<T>;
  enableColumnResize?: boolean;
}

function TableColumnBase<T extends Record<string, unknown>>({
  tableInstance,
  column,
  className,
  width,
  style,
  enableColumnResize = false,
}: TableColumnProps<T>) {
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

  const headerContent =
    typeof column.header === "function" ? column.header() : column.header;

  return (
    <div
      data-column-id={String(column.id)}
      className={cn(
        "rtg-table-header-cell",
        styles.TableColumn(),
        className,
        "group relative"
      )}
      style={{
        width: width ? `${width}px` : undefined,
        minWidth: width ? `${width}px` : undefined,
        ...style,
      }}
      role="columnheader"
      aria-sort={isCurrentSortColumn ? (sortDirection === 'asc' ? 'ascending' : 'descending') : "none"}
      aria-colindex={Number(column.id) + 1}
    >
      <div className="flex items-center w-full h-full">
        <div className="flex-1 overflow-hidden flex items-center">
          <span>{headerContent}</span>
          {column.sortable && (
            <button
              onClick={handleSortClick}
              className={styles.sortButton()}
              aria-label={`Sort by ${String(column.header)} ${isCurrentSortColumn ? `(currently ${sortDirection})` : ''}`}
              type="button"
            >
              <SortIcon
                direction={isCurrentSortColumn ? sortDirection : undefined}
                active={isCurrentSortColumn}
              />
            </button>
          )}
        </div>

        {enableColumnResize && (
          <div className="absolute right-0 top-0 h-full">
            <TableResizer
              columnId={String(column.id)}
              isResizing={isResizing}
              onResizeStart={handleColumnResizeStart}
              onResizeMove={handleColumnResizeMove}
              onResizeEnd={handleColumnResizeEnd}
              direction={columnResizeDirection}
              isDragging={!!columnResizeInfo.isResizingColumn}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export const TableColumn = memo(TableColumnBase) as typeof TableColumnBase;
