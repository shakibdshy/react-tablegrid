import type { Column } from "@/types/column.types";
import { useTableGrid } from "@/hooks/use-table-grid";
import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import type { TableCustomComponents } from "@/types/table.types";
import { TableColumn } from "./table-column";
import { getGridTemplateColumns, reorderColumns } from "@/utils/table-helper";
import { useMemo } from "react";
import "./table-header.css";

interface TableHeaderProps<T extends Record<string, unknown>> {
  tableInstance: ReturnType<typeof useTableGrid<T>>;
  className?: string;
  style?: React.CSSProperties;
  components?: TableCustomComponents<T>;
  enableColumnResize?: boolean;
  TableColumnClassName?: string;
  headerRowClassName?: string;
  withoutTailwind?: boolean;
}

export function TableHeader<T extends Record<string, unknown>>({
  tableInstance,
  className,
  TableColumnClassName,
  headerRowClassName,
  style,
  components,
  enableColumnResize = false,
  withoutTailwind = false,
}: TableHeaderProps<T>) {
  const styles = tableStyles();
  const {
    columns,
    state: { columnSizing, pinnedColumns },
  } = tableInstance;

  // Get ordered columns based on pinning
  const orderedColumns = useMemo(() => {
    return reorderColumns(columns, pinnedColumns);
  }, [columns, pinnedColumns]);

  return (
    <div
      className={cn(
        withoutTailwind ? 'rtg-header' : cn("rtg-table-header", styles.header()),
        className
      )}
      style={style}
      role="rowgroup"
    >
      <div
        className={cn(
          withoutTailwind ? 'rtg-header-row' : cn("rtg-table-header-row", styles.headerRow()),
          headerRowClassName
        )}
        style={{
          gridTemplateColumns: getGridTemplateColumns(
            orderedColumns,
            columnSizing
          ),
        }}
        role="row"
        aria-rowindex={1}
      >
        {orderedColumns.map((column: Column<T>, columnIndex) => {
          const width = columnSizing.columnSizes[String(column.id)];
          const isPinnedLeft = pinnedColumns.left.includes(column.accessorKey);
          const isPinnedRight = pinnedColumns.right.includes(
            column.accessorKey
          );

          let leftOffset = 0;
          if (isPinnedLeft) {
            leftOffset = orderedColumns
              .slice(0, columnIndex)
              .filter((col) => pinnedColumns.left.includes(col.accessorKey))
              .reduce(
                (sum, col) =>
                  sum + (columnSizing.columnSizes[String(col.id)] || 0),
                0
              );
          }

          let rightOffset = 0;
          if (isPinnedRight) {
            rightOffset = orderedColumns
              .slice(columnIndex + 1)
              .filter((col) => pinnedColumns.right.includes(col.accessorKey))
              .reduce(
                (sum, col) =>
                  sum + (columnSizing.columnSizes[String(col.id)] || 0),
                0
              );
          }

          return (
            <TableColumn<T>
              key={String(column.id)}
              tableInstance={tableInstance}
              column={column}
              width={width}
              enableColumnResize={enableColumnResize}
              withoutTailwind={withoutTailwind}
              className={cn(
                withoutTailwind 
                  ? [
                      'rtg-header-column',
                      isPinnedLeft && 'rtg-header-column--pinned-left',
                      isPinnedRight && 'rtg-header-column--pinned-right'
                    ]
                  : [
                      column.className,
                      isPinnedLeft &&
                        "sticky left-0 z-[35] shadow-[1px_0_0_0_theme(colors.gray.200)]",
                      isPinnedRight &&
                        "sticky right-0 z-[35] shadow-[-1px_0_0_0_theme(colors.gray.200)]",
                    ],
                TableColumnClassName,
              )}
              style={{
                ...(isPinnedLeft && { left: `${leftOffset}px`, zIndex: 35 }),
                ...(isPinnedRight && { right: `${rightOffset}px`, zIndex: 35 }),
                position: isPinnedLeft || isPinnedRight ? "sticky" : undefined,
              }}
              components={components}
            />
          );
        })}
      </div>
    </div>
  );
}
