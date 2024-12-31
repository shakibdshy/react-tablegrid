import type { ReactNode } from "react"

export type TableVariant = "modern" | "minimal" | "classic"
export type SortDirection = "asc" | "desc"

// Define strict types for data handling
export type UpdateDataFn<T> = (index: number, field: keyof T, value: T[keyof T]) => void

// Define strict column interface
export interface Column<T> {
  id: keyof T
  header: ReactNode | (() => ReactNode)
  accessorKey: keyof T
  sortable?: boolean
  className?: string
  width?: string
  group?: string
  pinned?: 'left' | 'right' | false
  cell?: (props: {
    value: T[keyof T]
    row: T
    onChange?: (value: T[keyof T]) => void
    onDelete?: () => void
    table?: {
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
  sortColumn: keyof T
  sortDirection: SortDirection
  filterValue?: string
  visibleColumns: Array<keyof T>
  pinnedColumns: {
    left: Array<keyof T>
    right: Array<keyof T>
  }
  columnSizing: { columnSizes: { [key: string]: number } }
  columnResizeMode: ColumnResizeMode
}

// New interfaces for customization
export interface TableCustomComponents<T> {
  Header?: React.ComponentType<{
    column: Column<T>;
    sortIcon?: React.ReactNode;
    onSort?: () => void;
  }>;
  Cell?: React.ComponentType<{
    column: Column<T>;
    row: T;
    value: T[keyof T];
  }>;
  EmptyState?: React.ComponentType;
  LoadingState?: React.ComponentType;
  SearchInput?: React.ComponentType<{
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }>;
}

export interface TableStyleConfig {
  header?: {
    className?: string;
    style?: React.CSSProperties;
  };
  row?: {
    className?: string;
    style?: React.CSSProperties;
  };
  cell?: {
    className?: string;
    style?: React.CSSProperties;
  };
  headerCell?: {
    className?: string;
    style?: React.CSSProperties;
  };
  container?: {
    className?: string;
    style?: React.CSSProperties;
  };
  searchContainer?: {
    className?: string;
    style?: React.CSSProperties;
  };
}

// Add this type to handle Fuse.js keys
export type FuseKeys<T> = Array<keyof T | string>;

// Define strict table props interface
export interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  variant?: TableVariant
  className?: string
  onSort?: (column: Column<T>) => void
  sortColumn?: keyof T
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
  fuzzySearchKeys?: FuseKeys<T>
  fuzzySearchThreshold?: number
  
  // New customization props
  components?: TableCustomComponents<T>;
  styleConfig?: TableStyleConfig;
  renderHeader?: (column: Column<T>) => ReactNode;
  renderCell?: (column: Column<T>, row: T, value: T[keyof T]) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderLoading?: () => ReactNode;
  renderSearch?: (props: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => ReactNode;
  isLoading?: boolean;
  columnResizeMode?: ColumnResizeMode
  onColumnSizingChange?: (columnSizing: { columnSizes: { [key: string]: number } }) => void
  columnResizeDirection?: 'ltr' | 'rtl'
  columnResizeInfo?: ColumnResizeInfoState
  columnSizing?: {
    columnSizes: { [key: string]: number }
  }
}

// Update TableGridReturn to use typed column ids
export interface TableGridReturn<T> {
  // Data
  data: T[]
  setData: (data: T[]) => void
  
  // Sorting
  sortColumn: keyof T
  sortDirection: SortDirection
  handleSort: (column: Column<T>) => void
  
  // Filtering
  filterValue: string
  setFilterValue: (value: string) => void
  filteredData: T[]
  
  // State
  state: TableState<T>
  resetState: () => void
  visibleColumns: Array<keyof T>
  toggleColumnVisibility: (columnId: keyof T) => void
  
  // Pinning
  pinnedColumns: {
    left: Array<keyof T>
    right: Array<keyof T>
  }
  toggleColumnPin: (columnId: keyof T, position: 'left' | 'right' | false) => void
}

// Add this interface for resize indicator state
export interface ColumnResizeInfoState {
  startX: number | null
  currentX: number | null
  deltaX: number | null
  isResizingColumn: string | false
  columnSizingStart: { [key: string]: number }
}

export type ColumnResizeMode = 'onChange' | 'onResize' 