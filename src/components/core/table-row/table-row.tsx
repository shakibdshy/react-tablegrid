import { useCallback } from "react";
import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import { TableCell } from "@/components/ui/table-cell";
import type { Column } from "@/types/column.types";
import type { useTableGrid } from "@/hooks/use-table-grid";
import { getGridTemplateColumns, reorderColumns } from "@/utils/table-helper";
import { useMemo } from "react";

interface TableRowProps<T extends Record<string, unknown>> {
  row: T;
  rowIndex: number;
  className?: string;
  cellClassName?: string;
  style?: React.CSSProperties;
  tableInstance: ReturnType<typeof useTableGrid<T>>;
  components?: {
    Cell?: React.ComponentType<{
      column: Column<T>;
      row: T;
      value: T[keyof T];
    }>;
  };
  customRender?: (
    column: Column<T>,
    row: T,
    value: T[keyof T]
  ) => React.ReactNode;
  isVirtual?: boolean;
  virtualStyle?: React.CSSProperties;
}

export function TableRow<T extends Record<string, unknown>>({
  row,
  rowIndex,
  className,
  style,
  tableInstance,
  components,
  customRender,
  isVirtual,
  virtualStyle,
  cellClassName,
}: TableRowProps<T>) {
  const styles = tableStyles();
  const {
    columns,
    state: { columnSizing, pinnedColumns },
    handleRowSelect,
  } = tableInstance;

  // Get ordered columns based on pinning
  const orderedColumns = useMemo(() => {
    return reorderColumns(columns, pinnedColumns);
  }, [columns, pinnedColumns]);

  const handleClick = useCallback(() => {
    handleRowSelect(row, rowIndex);
  }, [handleRowSelect, row, rowIndex]);

  return (
    <div
      className={cn("rtg-table-row", styles.row(), className)}
      style={{
        gridTemplateColumns: getGridTemplateColumns(
          orderedColumns,
          columnSizing
        ),
        ...(isVirtual ? virtualStyle : {}),
        ...style,
      }}
      onClick={handleClick}
      role="row"
      data-row-index={rowIndex}
      data-row-id={(row as { id?: string }).id}
    >
      {orderedColumns.map((column, columnIndex) => {
        const value = row[column.accessorKey];
        const width = columnSizing.columnSizes[String(column.id)];
        const isPinnedLeft = pinnedColumns.left.includes(column.accessorKey);
        const isPinnedRight = pinnedColumns.right.includes(column.accessorKey);

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
          <TableCell
            key={String(column.id)}
            column={column}
            row={row}
            rowIndex={rowIndex}
            value={value}
            width={width}
            className={cn(
              cellClassName,
              column.className,
              isPinnedLeft &&
                "sticky left-0 z-[25] shadow-[1px_0_0_0_theme(colors.gray.200)]",
              isPinnedRight &&
                "sticky right-0 z-[25] shadow-[-1px_0_0_0_theme(colors.gray.200)]",
              isPinnedLeft || isPinnedRight ? "bg-background" : undefined
            )}
            style={{
              ...(isPinnedLeft && { left: `${leftOffset}px` }),
              ...(isPinnedRight && { right: `${rightOffset}px` }),
            }}
            components={components}
            customRender={customRender}
          />
        );
      })}
    </div>
  );
}
