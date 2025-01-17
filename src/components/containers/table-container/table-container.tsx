import { forwardRef } from 'react'
import { cn } from '@/utils/cn'
import { tableStyles } from '@/styles/table.style'
import { TableHeader } from '@/components/core/table-header/table-header'
import { TableBody } from '@/components/containers/table-body/table-body'
import { VirtualizedBody } from '@/components/containers/table-body/virtualized-body'
import { TableSearch } from '@/components/core/table-search/table-search'
import { TableHeaderGroup } from '@/components/containers/table-header-group/table-header-group'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import type { TableProps, TableCustomRender, TableState } from '@/types/table.types'
import type { Column, ColumnResizeInfoState } from "@/types/column.types"
import { useTable } from '@/hooks/use-table-context'

interface TableContainerProps<T extends Record<string, unknown>> extends Omit<TableProps<T>, 'columns'> {
  style?: React.CSSProperties
  customRender?: TableCustomRender<T>
  columns: Column<T>[]
  columnResizeInfo?: ColumnResizeInfoState
  columnSizing?: TableState<T>['columnSizing']
  data: T[]
  onStateChange?: (state: TableState<T>) => void
  isLoading?: boolean
}

function TableContainerComponent<T extends Record<string, unknown>>(
  {
    className,
    style,
    maxHeight = '400px',
    enableFiltering = false,
    enableFuzzySearch = false,
    headerGroups = false,
    virtualization,
    serverSide,
    components,
    customRender,
    styleConfig,
    variant = 'modern',
    columns,
    data,
    onStateChange,
    isLoading,
  }: TableContainerProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const styles = tableStyles({ variant })
  const tableInstance = useTable<T>({
    data,
    columns,
    onStateChange,
    enableFuzzySearch,
    isLoading,
  })

  return (
    <div ref={ref} className="space-y-4">
      {(enableFiltering || enableFuzzySearch) && (
        <TableSearch
          className={cn(styles.searchContainer(), styleConfig?.searchContainer?.className)}
          style={styleConfig?.searchContainer?.style}
          enableFuzzySearch={enableFuzzySearch}
          components={components}
          customRender={customRender?.renderSearch}
          tableInstance={tableInstance}
        />
      )}

      {/* Table Container */}
      <div
        className={cn(
          styles.wrapper(),
          "relative",
          className
        )}
        style={{
          ...style,
          height: virtualization?.enabled ? maxHeight : undefined,
        }}
      >
        <SimpleBar
          style={{ maxHeight }}
          className={cn(
            styles.scrollContainer(),
            "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
          )}
          autoHide={false}
        >
          <div className={cn(
            styles.table(),
            "relative",
            "will-change-transform",
            "backface-visibility-hidden"
          )}>
            {/* Header Groups */}
            {headerGroups && (
              <TableHeaderGroup
                className={cn(
                  styleConfig?.header?.className,
                  "sticky top-0 z-20"
                )}
                style={styleConfig?.header?.style}
                customRender={{
                  group: (group) => customRender?.renderHeader?.(group.columns[0]),
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
              components={components}
              tableInstance={tableInstance}
            />

            {/* Body */}
            {virtualization?.enabled ? (
              <VirtualizedBody
                config={virtualization}
                customRender={{
                  row: customRender?.renderCell
                    ? (props) => {
                        const value = props.row[String(columns[0].accessorKey)] as T[keyof T];
                        return (customRender.renderCell?.(props.row as unknown as T, props.rowIndex, value) ?? null) as React.ReactElement;
                      }
                    : undefined,
                }}
                className={cn(
                  styleConfig?.row?.className,
                  "transition-colors"
                )}
                style={styleConfig?.row?.style}
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
                        return (customRender?.renderCell?.(row as T, props.rowIndex, value as T[keyof T]) ?? null) as React.ReactElement;
                      }
                    : undefined,
                }}
                className={cn(
                  styleConfig?.row?.className,
                  "transition-colors"
                )}
                style={styleConfig?.row?.style}
                tableInstance={tableInstance}
              />
            )}
          </div>
        </SimpleBar>
      </div>

      {/* Server-side Pagination */}
      {serverSide?.enabled && serverSide.pageSize && (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {serverSide.pageSize} items per page
            </div>
            {/* Add pagination controls here */}
          </div>
        </div>
      )}
    </div>
  )
}

const TableContainer = forwardRef(TableContainerComponent) as unknown as (<T extends Record<string, unknown>>(
  props: TableContainerProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => React.ReactElement) & { displayName?: string }

TableContainer.displayName = 'TableContainer'

export type { TableContainerProps }
export { TableContainer }
