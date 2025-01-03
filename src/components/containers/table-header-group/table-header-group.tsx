import { useMemo } from "react";
import { useTable } from "@/context/table-context";
import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import type { HeaderGroup } from "@/types/column.types";

interface TableHeaderGroupProps<T extends Record<string, unknown>> {
  className?: string;
  style?: React.CSSProperties;
  customRender?: {
    group?: (group: HeaderGroup<T>) => React.ReactNode;
  };
  components?: {
    HeaderGroup?: React.ComponentType<{
      group: HeaderGroup<T>;
      className?: string;
      style?: React.CSSProperties;
    }>;
  };
}

export function TableHeaderGroup<T extends Record<string, unknown>>({
  className,
  style,
  customRender,
  components,
}: TableHeaderGroupProps<T>) {
  const styles = tableStyles();
  const {
    columns,
    state: { columnSizing },
  } = useTable<T>();

  const headerGroups = useMemo(() => {
    const groupMap = new Map<string, HeaderGroup<T>>();

    columns.forEach((column) => {
      if (column.group) {
        if (!groupMap.has(column.group)) {
          groupMap.set(column.group, {
            id: column.group.toLowerCase().replace(/\s+/g, "-"),
            name: column.group,
            columns: [],
          });
        }
        groupMap.get(column.group)!.columns.push(column);
      }
    });

    return Array.from(groupMap.values());
  }, [columns]);

  const getGridTemplateColumns = () => {
    return columns
      .map((column) => {
        const width = columnSizing.columnSizes[String(column.id)];
        return width ? `${width}px` : "1fr";
      })
      .join(" ");
  };

  if (headerGroups.length === 0) return null;

  return (
    <div
      className={cn(styles.headerRow(), className)}
      style={{
        ...style,
        gridTemplateColumns: getGridTemplateColumns(),
      }}
    >
      {headerGroups.map((group) => {
        if (customRender?.group) {
          return (
            <div
              key={group.id}
              style={{
                gridColumn: `span ${group.columns.length}`,
              }}
            >
              {customRender.group(group)}
            </div>
          );
        }

        if (components?.HeaderGroup) {
          return (
            <components.HeaderGroup
              key={group.id}
              group={group}
              className={cn(
                styles.headerCell(),
                "text-center font-bold",
                `colspan-${group.columns.length}`
              )}
              style={{
                gridColumn: `span ${group.columns.length}`,
              }}
            />
          );
        }

        return (
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
        );
      })}
    </div>
  );
}
