import { useCallback } from "react";
import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import type { Column } from "@/types/column.types";
import type { UpdateDataFn } from "@/types/table.types";

interface TableCellProps<T> {
  column: Column<T>;
  row: T;
  rowIndex: number;
  value: T[keyof T];
  onRowChange?: UpdateDataFn<T>;
  onRowDelete?: (index: number) => void;
  className?: string;
  width?: number;
  style?: React.CSSProperties;
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
}

export function TableCell<T extends Record<string, unknown>>({
  column,
  row,
  rowIndex,
  value,
  onRowChange,
  onRowDelete,
  className,
  width,
  style,
  components,
  customRender,
}: TableCellProps<T>) {
  const styles = tableStyles();

  const handleChange = useCallback(
    (newValue: T[keyof T]) => {
      onRowChange?.(rowIndex, column.accessorKey, newValue);
    },
    [onRowChange, rowIndex, column.accessorKey]
  );

  const handleDelete = useCallback(() => {
    onRowDelete?.(rowIndex);
  }, [onRowDelete, rowIndex]);

  // Custom render function takes precedence
  if (customRender) {
    return (
      <div
        className={cn(styles.cell(), className)}
        style={{
          width: width ? `${width}px` : undefined,
          minWidth: width ? `${width}px` : undefined,
          ...style,
        }}
      >
        {customRender(column, row, value)}
      </div>
    );
  }

  // Component render is second priority
  if (components?.Cell) {
    return (
      <div
        className={cn(styles.cell(), className)}
        style={{
          width: width ? `${width}px` : undefined,
          minWidth: width ? `${width}px` : undefined,
          ...style,
        }}
      >
        <components.Cell column={column} row={row} value={value} />
      </div>
    );
  }

  // Column cell render function is third priority
  if (column.cell) {
    return (
      <div
        className={cn(styles.cell(), className)}
        style={{
          width: width ? `${width}px` : undefined,
          minWidth: width ? `${width}px` : undefined,
          ...style,
        }}
      >
        {column.cell({
          value,
          row,
          onChange: handleChange,
          onDelete: handleDelete,
          table: {
            options: {
              meta: {
                updateData: onRowChange!,
              },
            },
          },
        })}
      </div>
    );
  }

  // Default cell renderer
  return (
    <div
      className={cn(styles.cell(), className)}
      style={{
        width: width ? `${width}px` : undefined,
        minWidth: width ? `${width}px` : undefined,
        ...style,
      }}
    >
      {String(value)}
    </div>
  );
}