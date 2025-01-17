import type { Column } from "./column.types"
import { TableState } from "./table.types"
import { SortDirection } from "./table.types"

/**
 * Type definitions for table events
 */
export interface TableEventMap<T> {
  /** Called when a column is sorted */
  onSort: (column: Column<T>, direction: SortDirection) => void
  /** Called when the filter value changes */
  onFilter: (value: string, filteredData: T[]) => void
  /** Called when a column is resized */
  onColumnResize: (columnId: keyof T, width: number) => void
  /** Called when a column's visibility changes */
  onColumnVisibilityChange: (columnId: keyof T, isVisible: boolean) => void
  /** Called when a column is pinned/unpinned */
  onColumnPin: (columnId: keyof T, position: 'left' | 'right' | false) => void
  /** Called when a row is selected */
  onRowSelect: (row: T, index: number) => void
  /** Called when the table state changes */
  onStateChange: (state: TableState<T>) => void
}

/**
 * Configuration for server-side operations
 */
export interface ServerSideConfig<T> {
  enabled: boolean
  totalRows: number
  pageSize: number
  currentPage: number
  loading: boolean
  onFetch: (options: {
    page: number
    pageSize: number
    sortColumn?: keyof T
    sortDirection?: SortDirection
    filters?: Record<string, unknown>
  }) => Promise<T[]>
  onPageChange?: (page: number) => void
}

/**
 * Configuration for virtualization
 */
export interface VirtualizationConfig {
  enabled: boolean
  rowHeight: number
  overscan: number
  scrollingDelay?: number
  initialScrollOffset?: number
  onEndReached?: () => void
} 