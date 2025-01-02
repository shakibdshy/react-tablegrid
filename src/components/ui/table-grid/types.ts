import type { ReactNode } from "react"
import { TableEventMap } from "./utility-types"
import { ServerSideConfig } from "./utility-types"
import { VirtualizationConfig } from "./utility-types"

export type TableVariant = "modern" | "minimal" | "classic"
export type SortDirection = "asc" | "desc"

// Define strict types for data handling
export type UpdateDataFn<T> = (index: number, field: keyof T, value: T[keyof T]) => void

// Define strict column interface
/**
 * Defines the structure of a table column
 * @template T - Type of data being displayed in the table
 */
export interface Column<T> {
  /** Unique identifier for the column */
  id: keyof T
  /** Header content or function to render header */
  header: ReactNode | (() => ReactNode)
  /** Key to access data in row object */
  accessorKey: keyof T
  /** Whether the column is sortable */
  sortable?: boolean
  /** Additional CSS classes for the column */
  className?: string
  /** Width of the column */
  width?: string
  /** Group name for the column */
  group?: string
  /** Pin position for the column */
  pinned?: 'left' | 'right' | false
  /** Custom cell renderer */
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
  virtualization?: VirtualizationConfig
  serverSide?: ServerSideConfig<T>
  events?: Partial<TableEventMap<T>>
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
/**
 * Configuration for table resizing functionality
 */
export interface ColumnResizeInfoState {
  /** Starting X coordinate of resize operation */
  startX: number | null
  /** Current X coordinate during resize */
  currentX: number | null
  /** Change in X coordinate from start */
  deltaX: number | null
  /** ID of column being resized or false if none */
  isResizingColumn: string | false
  /** Initial widths of columns when resize started */
  columnSizingStart: { [key: string]: number }
}

export type ColumnResizeMode = 'onChange' | 'onResize' 