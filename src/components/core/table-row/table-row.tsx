import { useCallback } from "react";
import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import { TableCell } from "@/components/ui/table-cell";
import type { Column } from "@/types/column.types";
import type { useTable } from "@/hooks/use-table-context";

interface TableRowProps<T extends Record<string, unknown>> {
  row: T;
  rowIndex: number;
  className?: string;
  style?: React.CSSProperties;
  tableInstance: ReturnType<typeof useTable<T>>;
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
}: TableRowProps<T>) {
  const styles = tableStyles();
  const {
    columns,
    state: { columnSizing },
    handleRowSelect,
  } = tableInstance;

  const handleClick = useCallback(() => {
    handleRowSelect(row, rowIndex);
  }, [handleRowSelect, row, rowIndex]);

  const getGridTemplateColumns = () => {
    return columns
      .map((column) => {
        const width = columnSizing.columnSizes[String(column.id)];
        return width ? `${width}px` : "1fr";
      })
      .join(" ");
  };

  return (
    <div
      className={cn(styles.row(), className)}
      style={{
        gridTemplateColumns: getGridTemplateColumns(),
        ...(isVirtual ? virtualStyle : {}),
        ...style,
      }}
      onClick={handleClick}
      role="row"
      data-row-index={rowIndex}
      data-row-id={(row as { id?: string }).id}
    >
      {columns.map((column) => {
        const value = row[column.accessorKey];
        const width = columnSizing.columnSizes[String(column.id)];

        return (
          <TableCell
            key={String(column.id)}
            column={column}
            row={row}
            rowIndex={rowIndex}
            value={value}
            width={width}
            className={column.className}
            components={components}
            customRender={customRender}
          />
        );
      })}
    </div>
  );
}
