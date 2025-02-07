import type { ReactNode } from "react";
import type { Column } from "./column.types";
import type {
  TableEventMap,
  ServerSideConfig,
  VirtualizationConfig,
} from "./events.types";
import type { ColumnResizeInfoState, ColumnResizeMode } from "./column.types";

export type TableVariant = "modern" | "minimal" | "classic";
export type SortDirection = "asc" | "desc";

// Define strict types for data handling
export type UpdateDataFn<T> = (
  index: number,
  field: keyof T,
  value: T[keyof T]
) => void;

export interface TableState<T> {
  data: T[];
  sortColumn: keyof T;
  sortDirection: SortDirection;
  filterValue?: string;
  visibleColumns: Array<keyof T>;
  pinnedColumns: {
    left: Array<keyof T>;
    right: Array<keyof T>;
  };
  columnSizing: { columnSizes: { [key: string]: number } };
  columnResizeMode: ColumnResizeMode;
  loading?: boolean;
}

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
  renderCell?: (row: T, rowIndex: number, value: unknown) => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderError?: (error: Error) => React.ReactNode;
}

export interface TableStyleConfig {
  container?: {
    className?: string;
    style?: React.CSSProperties;
    wrapperClassName?: string;
    scrollContainerClassName?: string;
    tableClassName?: string;
  };
  header?: {
    className?: string;
    style?: React.CSSProperties;
    headerRowClassName?: string;
    headerCellClassName?: string;
    headerGroupClassName?: string;
  };

  body?: {
    style?: React.CSSProperties;
    className?: string;
    rowClassName?: string;
    cellClassName?: string;
  };

  resizer?: {
    className?: string;
    style?: React.CSSProperties;
  };

  resizerIndicator?: {
    className?: string;
    style?: React.CSSProperties;
  };

  sortButton?: {
    className?: string;
    style?: React.CSSProperties;
  };

  utilityStyles?: {
    emptyClassName?: string;
    searchContainerClassName?: string;
    searchInputClassName?: string;
    loadingClassName?: string;
    style?: React.CSSProperties;
  };
}

// Add this type to handle Fuse.js keys
export type FuseKeys<T> = Array<keyof T | string>;

export interface TableCustomRender<T> {
  renderHeader?: (column: Column<T>) => ReactNode;
  renderCell?: (row: T, rowIndex: number, value: T[keyof T]) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderLoading?: () => ReactNode;
  renderSearch?: (props: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  variant?: TableVariant;
  className?: string;
  sortColumn?: keyof T;
  sortDirection?: SortDirection;
  gridTemplateColumns?: string;
  maxHeight?: string;
  onRowChange?: UpdateDataFn<T>;
  onRowDelete?: (index: number) => void;
  meta?: {
    updateData?: UpdateDataFn<T>;
  };
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;
  enableFiltering?: boolean;
  headerGroups?: boolean;
  enableFuzzySearch?: boolean;
  fuzzySearchKeys?: FuseKeys<T>;
  fuzzySearchThreshold?: number;
  /** Whether column resizing is enabled. Defaults to false. */
  enableColumnResize?: boolean;

  // Customization props
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

  // Column resize props
  columnResizeMode?: ColumnResizeMode;
  onColumnSizingChange?: (columnSizing: {
    columnSizes: { [key: string]: number };
  }) => void;
  columnResizeDirection?: "ltr" | "rtl";
  columnResizeInfo?: ColumnResizeInfoState;
  columnSizing?: {
    columnSizes: { [key: string]: number };
  };

  // Advanced features
  virtualization?: VirtualizationConfig;
  serverSide?: ServerSideConfig<T>;
  events?: Partial<TableEventMap<T>>;
}

export interface TableGridReturn<T> {
  // Data
  data: T[];
  setData: (data: T[]) => void;

  // Sorting
  sortColumn: keyof T;
  sortDirection: SortDirection;
  handleSort: (column: Column<T>) => void;

  // Filtering
  filterValue: string;
  setFilterValue: (value: string) => void;
  filteredData: T[];

  // State
  state: TableState<T>;
  resetState: () => void;
  visibleColumns: Array<keyof T>;
  toggleColumnVisibility: (columnId: keyof T) => void;

  // Pinning
  pinnedColumns: {
    left: Array<keyof T>;
    right: Array<keyof T>;
  };
  toggleColumnPin: (
    columnId: keyof T,
    position: "left" | "right" | false
  ) => void;
}

export interface TableContextValue<T> {
  // State
  state: TableState<T>;
  columns: Column<T>[];
  data: T[];
  filteredData: T[];

  // Column management
  visibleColumns: Array<keyof T>;
  toggleColumnVisibility: (columnId: keyof T) => void;
  pinnedColumns: {
    left: Array<keyof T>;
    right: Array<keyof T>;
  };
  toggleColumnPin: (
    columnId: keyof T,
    position: "left" | "right" | false
  ) => void;

  // Sorting
  sortColumn: keyof T;
  sortDirection: SortDirection;
  handleSort: (column: Column<T>) => void;

  // Filtering
  filterValue: string;
  setFilterValue: (value: string) => void;

  // Column resizing
  columnSizing: { columnSizes: { [key: string]: number } };
  columnResizeInfo: ColumnResizeInfoState;
  columnResizeMode: "onChange" | "onResize";
  columnResizeDirection: "ltr" | "rtl";
  handleColumnResize: (columnId: string, width: number) => void;
  handleColumnResizeStart: (columnId: string, startX: number) => void;
  handleColumnResizeMove: (currentX: number) => void;
  handleColumnResizeEnd: () => void;

  // Row management
  handleRowSelect: (row: T, index: number) => void;

  // State management
  resetState: () => void;
  setData: (data: T[]) => void;
  handleStateChange: (state: TableState<T>) => void;
}
