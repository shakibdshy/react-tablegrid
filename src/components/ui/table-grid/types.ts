import type { ReactNode } from "react"

export type TableVariant = "modern" | "minimal" | "classic"
export type SortDirection = "asc" | "desc"

// Define strict types for data handling
export type UpdateDataFn<T> = (index: number, field: keyof T, value: T[keyof T]) => void

// Define strict column interface
export interface Column<T> {
  id: string
  header: ReactNode | (() => ReactNode)
  accessorKey: keyof T
  sortable?: boolean
  className?: string
  width?: string
  group?: string
  pinned?: 'left' | 'right' | false
  cell?: (props: {
    value: T[keyof T]
    onChange: (value: T[keyof T]) => void
    onDelete?: () => void
    row: {
      original: T
      index: number
    }
    table: {
      options: {
        meta: {
          updateData: UpdateDataFn<T>
        }
      }
    }
  }) => ReactNode
}

export interface HeaderGroup<T> {
  id: string;
  name: string;
  columns: Column<T>[];
}

export interface TableState<T> {
  data: T[]
  sortColumn: string
  sortDirection: SortDirection
  filterValue?: string
  visibleColumns: string[]
  pinnedColumns: {
    left: string[]
    right: string[]
  }
}

// Define strict table props interface
export interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  variant?: TableVariant
  className?: string
  onSort?: (column: Column<T>) => void
  sortColumn?: string
  sortDirection?: SortDirection
  gridTemplateColumns?: string
  maxHeight?: string
  onRowChange?: UpdateDataFn<T>
  onRowDelete?: (index: number) => void
  meta?: {
    updateData?: UpdateDataFn<T>
  }
  filterValue?: string
  onFilterChange?: (value: string) => void
  filterPlaceholder?: string
  enableFiltering?: boolean
  headerGroups?: boolean
  enableFuzzySearch?: boolean
  fuzzySearchKeys?: Array<keyof T & string>
  fuzzySearchThreshold?: number
  
} 