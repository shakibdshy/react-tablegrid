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

interface TableContainerProps<T extends Record<string, unknown>> extends Omit<TableProps<T>, 'columns'> {
  style?: React.CSSProperties
  customRender?: TableCustomRender<T>
  columns: Column<T>[];
  columnResizeInfo?: ColumnResizeInfoState;
  columnSizing?: TableState<T>['columnSizing'];
}

export const TableContainer = forwardRef<
  HTMLDivElement,
  TableContainerProps<Record<string, unknown>>
>(({
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
}, ref) => {
  const styles = tableStyles({ variant })

  return (
    <div ref={ref} className="space-y-4">
      {/* Search Section */}
      {(enableFiltering || enableFuzzySearch) && (
        <TableSearch
          className={cn(styles.searchContainer(), styleConfig?.searchContainer?.className)}
          style={styleConfig?.searchContainer?.style}
          enableFuzzySearch={enableFuzzySearch}
          components={components}
          customRender={customRender?.renderSearch}
        />
      )}

      {/* Table Container */}
      <div
        className={cn(styles.wrapper(), className)}
        style={{
          ...style,
          height: virtualization?.enabled ? '400px' : undefined,
        }}
      >
        <SimpleBar
          style={{ maxHeight }}
          className={styles.scrollContainer()}
          autoHide={false}
        >
          <div className={styles.table()}>
            {/* Header Groups */}
            {headerGroups && (
              <TableHeaderGroup
                className={styleConfig?.header?.className}
                style={styleConfig?.header?.style}
                customRender={{
                  group: (group) => customRender?.renderHeader?.(group.columns[0]),
                }}
              />
            )}

            {/* Header */}
            <TableHeader
              className={styleConfig?.header?.className}
              enableHeaderGroups={headerGroups}
              components={components}
            />

            {/* Body */}
            {virtualization?.enabled ? (
              <VirtualizedBody
                config={virtualization}
                customRender={{
                  row: customRender?.renderCell
                    ? (props) => (customRender.renderCell?.(props.row, props.rowIndex, undefined) ?? null) as React.ReactElement
                    : undefined,
                }}
                className={styleConfig?.row?.className}
                style={styleConfig?.row?.style}
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
                    ? (props) => (customRender.renderCell?.(props.row, props.rowIndex, undefined) ?? null) as React.ReactElement
                    : undefined,
                }}
                className={styleConfig?.row?.className}
                style={styleConfig?.row?.style}
              />
            )}
          </div>
        </SimpleBar>
      </div>

      {/* TODO: Server-side Pagination */}
      {serverSide?.enabled && serverSide.pageSize && (
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {serverSide.pageSize} items per page
            </div>
            {/* Add pagination controls here */}
          </div>
        </div>
      )}
    </div>
  )
})

TableContainer.displayName = 'TableContainer'
