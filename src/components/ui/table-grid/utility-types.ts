import type { TableState, Column, SortDirection } from './types'

// Utility type for strict table events
export type TableEventMap<T> = {
  onSort: (column: Column<T>, direction: SortDirection) => void
  onFilter: (value: string, filteredData: T[]) => void
  onColumnResize: (columnId: keyof T, width: number) => void
  onColumnVisibilityChange: (columnId: keyof T, isVisible: boolean) => void
  onColumnPin: (columnId: keyof T, position: 'left' | 'right' | false) => void
  onRowSelect: (row: T, index: number) => void
  onStateChange: (state: TableState<T>) => void
}

// Type for virtualization config
export interface VirtualizationConfig {
  enabled: boolean
  rowHeight: number
  overscan: number
  scrollingDelay?: number
  initialScrollOffset?: number
}

// Type for server-side operations
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

// Strict type for column definitions
export type StrictColumn<T> = Omit<Column<T>, 'id'> & {
  id: keyof T
}

// Utility type for deep partial
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Type for memoization keys
export type MemoKeys<T> = Array<keyof T | string>

// Type for custom renderers
export type CustomRenderer<T> = (props: {
  data: T
  index: number
  style: React.CSSProperties
}) => React.ReactNode 