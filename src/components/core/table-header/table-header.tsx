import type { Column } from "@/types/column.types";
import { useTable } from "@/hooks/use-table-context";
import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import type { TableCustomComponents } from "@/types/table.types";
import { HeaderCell } from "./header-cell";
import { getGridTemplateColumns, reorderColumns } from "@/utils/table-helper";
import { useMemo } from "react";

interface TableHeaderProps<T extends Record<string, unknown>> {
  tableInstance: ReturnType<typeof useTable<T>>;
  className?: string;
  components?: TableCustomComponents<T>;
}

export function TableHeader<T extends Record<string, unknown>>({
  tableInstance,
  className,
  components,
}: TableHeaderProps<T>) {
  const styles = tableStyles();
  const { columns, state: { columnSizing, pinnedColumns } } = tableInstance;

  // Get ordered columns based on pinning
  const orderedColumns = useMemo(() => {
    return reorderColumns(columns, pinnedColumns);
  }, [columns, pinnedColumns]);

  return (
    <div className={cn(styles.header(), className)}>
      <div
        className={styles.headerRow()}
        style={{ gridTemplateColumns: getGridTemplateColumns(orderedColumns, columnSizing) }}
      >
        {orderedColumns.map((column: Column<T>, columnIndex) => {
          const width = columnSizing.columnSizes[String(column.id)];
          const isPinnedLeft = pinnedColumns.left.includes(column.accessorKey);
          const isPinnedRight = pinnedColumns.right.includes(column.accessorKey);

          let leftOffset = 0;
          if (isPinnedLeft) {
            leftOffset = orderedColumns
              .slice(0, columnIndex)
              .filter(col => pinnedColumns.left.includes(col.accessorKey))
              .reduce((sum, col) => sum + (columnSizing.columnSizes[String(col.id)] || 0), 0);
          }

          let rightOffset = 0;
          if (isPinnedRight) {
            rightOffset = orderedColumns
              .slice(columnIndex + 1)
              .filter(col => pinnedColumns.right.includes(col.accessorKey))
              .reduce((sum, col) => sum + (columnSizing.columnSizes[String(col.id)] || 0), 0);
          }

          return (
            <HeaderCell<T>
              key={String(column.id)}
              tableInstance={tableInstance}
              column={column}
              width={width}
              className={cn(
                column.className,
                isPinnedLeft && "sticky left-0 z-[35] shadow-[1px_0_0_0_theme(colors.gray.200)]",
                isPinnedRight && "sticky right-0 z-[35] shadow-[-1px_0_0_0_theme(colors.gray.200)]",
                "dark:shadow-[0_0_0_1px_theme(colors.gray.600)]"
              )}
              style={{
                ...(isPinnedLeft && { left: `${leftOffset}px` }),
                ...(isPinnedRight && { right: `${rightOffset}px` }),
                // backgroundColor: isPinnedLeft || isPinnedRight ? "bg-gray-100 dark:bg-gray-700" : undefined,
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
