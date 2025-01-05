import type { Column } from "@/types/column.types";
import { useTable } from "@/hooks/use-table-context";
import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import type { TableCustomComponents } from "@/types/table.types";
import { HeaderCell } from "./header-cell";

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
  const { columns, state: { columnSizing } } = tableInstance;

  const getGridTemplateColumns = () => {
    return columns
      .map((column: Column<T>) => {
        const width = columnSizing.columnSizes[String(column.id)];
        return width ? `${width}px` : "1fr";
      })
      .join(" ");
  };

  return (
    <div className={cn(styles.header(), className)}>
      <div
        className={styles.headerRow()}
        style={{ gridTemplateColumns: getGridTemplateColumns() }}
      >
        {columns.map((column: Column<T>) => {
          const width = columnSizing.columnSizes[String(column.id)];
          return (
            <HeaderCell<T>
              key={String(column.id)}
              tableInstance={tableInstance}
              column={column}
              width={width}
              className={column.className}
              components={components}
            />
          );
        })}
      </div>
    </div>
  );
}
