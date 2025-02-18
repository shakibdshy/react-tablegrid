import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import type { Column, HeaderGroup } from "@/types/column.types";
import type { useTableGrid } from "@/hooks/use-table-grid";
import { useMemo } from "react";
import { getGridTemplateColumns, reorderColumns } from "@/utils/table-helper";
import "./table-header-group.css";

interface TableHeaderGroupProps<T extends Record<string, unknown>> {
  className?: string;
  style?: React.CSSProperties;
  tableInstance: ReturnType<typeof useTableGrid<T>>;
  TableColumnClassName?: string;
  customRender?: {
    group: (group: HeaderGroup<T>) => React.ReactNode;
  };
  headerGroupClassName?: string;
  withoutTailwind?: boolean;
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

export function TableHeaderGroup<T extends Record<string, unknown>>({
  className,
  style,
  tableInstance,
  customRender,
  TableColumnClassName,
  headerGroupClassName,
  withoutTailwind = false,
}: TableHeaderGroupProps<T>) {
  const styles = tableStyles();
  const {
    columns,
    state: { columnSizing, pinnedColumns },
  } = tableInstance;

  // Get ordered columns based on pinning
  const orderedColumns = useMemo(() => {
    return reorderColumns(columns, pinnedColumns);
  }, [columns, pinnedColumns]);

  // Generate header groups from ordered columns
  const headerGroups = useMemo(() => {
    return generateHeaderGroups(orderedColumns);
  }, [orderedColumns]);

  if (headerGroups.length === 0) {
    return null;
  }

  const renderGroupContent = (group: HeaderGroup<T>) => {
    if (customRender?.group) {
      const content = customRender.group(group);
      return content || group.name;
    }
    return group.name;
  };

  return (
    <div
      className={cn(
        withoutTailwind 
          ? "rtg-header-group"
          : cn("rtg-table-header-group grid", styles.headerGroup()),
        className
      )}
      style={{
        ...style,
        gridTemplateColumns: getGridTemplateColumns(
          orderedColumns,
          columnSizing
        ),
      }}
      role="rowgroup"
      aria-label="Column Groups"
    >
      {headerGroups.map((group) => (
        <div
          key={group.id}
          className={cn(
            withoutTailwind
              ? "rtg-header-group-cell"
              : cn(
                  "rtg-table-header-cell",
                  styles.TableColumn(),
                  "text-center font-bold"
                ),
            TableColumnClassName,
            headerGroupClassName
          )}
          style={{
            gridColumn: `span ${group.columns.length}`,
          }}
          role="columnheader"
          aria-label={`Column group: ${group.name}`}
          aria-colspan={group.columns.length}
        >
          {renderGroupContent(group)}
        </div>
      ))}
    </div>
  );
}
