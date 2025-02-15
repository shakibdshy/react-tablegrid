import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import { TableHeader } from "@/components/core/table-header/table-header";
import { TableBody } from "@/components/containers/table-body/table-body";
import { VirtualizedBody } from "@/components/containers/table-body/virtualized-body";
import { TableSearch } from "@/components/core/table-search/table-search";
import { TableHeaderGroup } from "@/components/containers/table-header-group/table-header-group";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import type {
  TableProps,
  TableCustomRender,
  TableState,
} from "@/types/table.types";
import type { ServerSideConfig } from "@/types/events.types";
import type { Column, ColumnResizeInfoState } from "@/types/column.types";
import { useTableGrid } from "@/hooks/use-table-grid";

interface TableContainerProps<T extends Record<string, unknown>>
  extends Omit<TableProps<T>, "columns"> {
  style?: React.CSSProperties;
  customRender?: TableCustomRender<T>;
  columns: Column<T>[];
  columnResizeInfo?: ColumnResizeInfoState;
  columnSizing?: TableState<T>["columnSizing"];
  data: T[];
  onStateChange?: (state: TableState<T>) => void;
  isLoading?: boolean;
  serverSide?: ServerSideConfig<T>;
  enableColumnResize?: boolean;
  state?: TableState<T>;
  columnResizeDirection?: "ltr" | "rtl";
}

function TableContainerComponent<T extends Record<string, unknown>>(
  {
    className,
    style,
    maxHeight = "400px",
    enableFiltering = false,
    headerGroups = false,
    virtualization,
    components,
    customRender,
    styleConfig,
    variant = "modern",
    columns,
    data,
    onStateChange,
    isLoading,
    serverSide,
    enableColumnResize,
    state,
    columnResizeDirection = "ltr",
  }: TableContainerProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const styles = tableStyles({ variant });
  const tableInstance = useTableGrid<T>({
    data,
    columns,
    onStateChange,
    isLoading,
    serverSide,
    initialState: state,
    columnResizeDirection,
  });

  return (
    <div ref={ref} className="space-y-4">
      {enableFiltering && (
        <TableSearch
          className={cn(
            styles.searchContainer(),
            styleConfig?.utilityStyles?.searchContainerClassName
          )}
          searchInputClassName={styleConfig?.utilityStyles?.searchInputClassName}
          style={styleConfig?.utilityStyles?.style}
          components={components}
          customRender={customRender?.renderSearch}
          tableInstance={tableInstance}

        />
      )}

      {/* Table Container */}
      <div
        className={cn(
          styles.wrapper(),
          styleConfig?.container?.wrapperClassName,
          className
        )}
        style={{
          ...styleConfig?.container?.style,
          ...style,
        }}
      >
        <SimpleBar
          style={{ maxHeight }}
          className={cn(
            styles.scrollContainer(),
            styleConfig?.container?.scrollContainerClassName,
            "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          )}
          autoHide={false}
        >
          <div
            className={cn(
              styles.table(),
              styleConfig?.container?.tableClassName,
              "relative",
              "will-change-transform",
              "backface-visibility-hidden"
            )}
          >
            {/* Header Groups */}
            {headerGroups && (
              <TableHeaderGroup
                className={cn(
                  styleConfig?.header?.className,
                  "sticky top-0 z-20"
                )}
                headerGroupClassName={styleConfig?.header?.headerGroupClassName}
                style={styleConfig?.header?.style}
                customRender={{
                  group: (group) =>
                    customRender?.renderHeader?.(group.columns[0] as Column<T>),
                }}

                tableInstance={tableInstance}
              />
            )}

            {/* Header */}
            <TableHeader
              className={cn(
                styleConfig?.header?.className,
                "sticky top-0 z-10"
              )}
              headerCellClassName={styleConfig?.header?.headerCellClassName}
              headerRowClassName={styleConfig?.header?.headerRowClassName}
              style={styleConfig?.header?.style}
              components={components}
              tableInstance={tableInstance}
              enableColumnResize={enableColumnResize}
            />

            {/* Body */}
            {virtualization?.enabled ? (
              <VirtualizedBody
                config={virtualization}
                customRender={{
                  row: customRender?.renderCell
                    ? (props) => {
                        const value = props.row[
                          String(columns[0].accessorKey)
                        ] as T[keyof T];
                        return (customRender.renderCell?.(
                          props.row as unknown as T,
                          props.rowIndex,
                          value
                        ) ?? null) as React.ReactElement;
                      }
                    : undefined,
                }}
                className={cn(
                  styleConfig?.body?.className,
                  "transition-colors"
                )}
                bodyRowClassName={styleConfig?.body?.rowClassName}
                bodyCellClassName={styleConfig?.body?.cellClassName}
                style={styleConfig?.body?.style}
                tableInstance={tableInstance}
              />

            ) : (
              <TableBody
                components={{
                  EmptyState: components?.EmptyState,
                  LoadingState: components?.LoadingState,
                }}
                customRender={{
                  empty: customRender?.renderEmpty,
                  loading: customRender?.renderLoading,
                  row: customRender?.renderCell
                    ? (props) => {
                        const row = props.row as Record<string, unknown>;
                        const accessorKey = String(columns[0].accessorKey);
                        const value = row[accessorKey];
                        return (customRender?.renderCell?.(
                          row as T,
                          props.rowIndex,
                          value as T[keyof T]
                        ) ?? null) as React.ReactElement;
                      }
                    : undefined,
                }}
                className={cn(
                  styleConfig?.body?.className,
                  "transition-colors"
                )}
                bodyRowClassName={styleConfig?.body?.rowClassName}
                bodyCellClassName={styleConfig?.body?.cellClassName}
                style={styleConfig?.body?.style}
                tableInstance={tableInstance}

              />
            )}
          </div>
        </SimpleBar>
      </div>
    </div>
  );
}

const TableContainer = forwardRef(TableContainerComponent) as unknown as (<
  T extends Record<string, unknown>
>(
  props: TableContainerProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement) & { displayName?: string };

TableContainer.displayName = "TableContainer";

export type { TableContainerProps };
export { TableContainer };
