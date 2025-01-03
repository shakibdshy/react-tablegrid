import { useMemo } from "react";
import type { Column, HeaderGroup } from "@/types/column.types";
import { useTable } from "@/context/table-context";
import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import type { TableCustomComponents } from "@/types/table.types";
import { HeaderCell } from "./header-cell";

interface TableHeaderProps<T> {
  className?: string;
  enableHeaderGroups?: boolean;
  components?: TableCustomComponents<T>;
}

function generateHeaderGroups<T extends Record<string, unknown>>(
  columns: Column<T>[]
): HeaderGroup<T>[] {
  const groupMap = new Map<string, Column<T>[]>();

  columns.forEach((column) => {
    if (column.group) {
      if (!groupMap.has(column.group)) {
        groupMap.set(column.group, []);
      }
      groupMap.get(column.group)!.push(column);
    }
  });

  return Array.from(groupMap.entries()).map(([name, groupColumns]) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    columns: groupColumns,
  }));
}

export function TableHeader<T extends Record<string, unknown>>({
  className,
  enableHeaderGroups = false,
  components,
}: TableHeaderProps<T>) {
  const styles = tableStyles();
  const {
    columns,
    state: { columnSizing },
  } = useTable<T>();

  const headerGroups = useMemo(() => {
    if (!enableHeaderGroups) return [];
    return generateHeaderGroups(columns);
  }, [columns, enableHeaderGroups]);

  const getGridTemplateColumns = () => {
    return columns
      .map((column) => {
        const width = columnSizing.columnSizes[String(column.id)];
        return width ? `${width}px` : "1fr";
      })
      .join(" ");
  };

  return (
    <div className={cn(styles.header(), className)}>
      {enableHeaderGroups && headerGroups.length > 0 && (
        <div
          className={styles.headerRow()}
          style={{ gridTemplateColumns: getGridTemplateColumns() }}
        >
          {headerGroups.map((group) => (
            <div
              key={group.id}
              className={cn(
                styles.headerCell(),
                "text-center font-bold",
                `colspan-${group.columns.length}`
              )}
              style={{
                gridColumn: `span ${group.columns.length}`,
              }}
            >
              {group.name}
            </div>
          ))}
        </div>
      )}

      <div
        className={styles.headerRow()}
        style={{ gridTemplateColumns: getGridTemplateColumns() }}
      >
        {columns.map((column) => {
          const width = columnSizing.columnSizes[String(column.id)];
          return (
            <HeaderCell
              key={String(column.id)}
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
