import type { Column } from './types'

/**
 * Helper functions for creating and managing table columns
 * Provides type-safe column definitions with various configuration options
 */

/**
 * Column definition with display options
 * @template TData - Type of data being displayed
 * @template TValue - Type of value in the column
 */
export type DisplayColumnDef<TData, TValue = unknown> = Omit<Column<TData>, 'id' | 'accessorKey'> & {
  /** Optional column identifier */
  id?: keyof TData
  /** Custom cell renderer function */
  cell?: (props: { value: TValue; row: TData }) => React.ReactNode
}

/**
 * Column definition with grouping support
 * @template TData - Type of data being displayed
 * @template TValue - Type of value in the column
 */
export type GroupColumnDef<TData, TValue = unknown> = DisplayColumnDef<TData, TValue> & {
  /** Nested columns within the group */
  columns?: Column<TData>[]
}

export interface ColumnHelper<TData> {
  accessor: <TKey extends keyof TData & string>(
    accessorKey: TKey,
    columnDef?: Omit<DisplayColumnDef<TData, TData[TKey]>, 'id' | 'accessorKey'>
  ) => Column<TData>
  
  display: (columnDef: DisplayColumnDef<TData>) => Column<TData>
  
  group: (columnDef: GroupColumnDef<TData>) => Column<TData>
}

/**
 * Creates a column helper with type-safe methods for defining columns
 * @template TData - Type of data being displayed in the table
 */
export function createColumnHelper<TData>(): ColumnHelper<TData> {
  return {
    /**
     * Creates an accessor column with automatic type inference
     * @param accessorKey - Key to access data in the row
     * @param columnDef - Additional column configuration
     */
    accessor: <TKey extends keyof TData & string>(
      accessorKey: TKey,
      columnDef: Partial<DisplayColumnDef<TData, TData[TKey]>> = {}
    ): Column<TData> => ({
      id: accessorKey,
      accessorKey,
      header: columnDef.header ?? String(accessorKey),
      sortable: columnDef.sortable ?? true,
      className: columnDef.className,
      width: columnDef.width,
      group: columnDef.group,
      pinned: columnDef.pinned,
      cell: columnDef.cell,
    }),

    display: (columnDef) => ({
      id: columnDef.id ?? (String(Math.random()) as keyof TData),
      accessorKey: columnDef.id as keyof TData ?? ('' as keyof TData),
      ...columnDef,
    }),

    group: (columnDef) => ({
      id: columnDef.id ?? (String(Math.random()) as keyof TData),
      accessorKey: columnDef.id as keyof TData ?? ('' as keyof TData),
      ...columnDef,
    }),
  }
} 