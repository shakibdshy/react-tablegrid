import type { Column } from './types'

export type DisplayColumnDef<TData, TValue = unknown> = Omit<Column<TData>, 'id' | 'accessorKey'> & {
  id?: keyof TData
  cell?: (props: { value: TValue; row: TData }) => React.ReactNode
}

export type GroupColumnDef<TData, TValue = unknown> = DisplayColumnDef<TData, TValue> & {
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

export function createColumnHelper<TData>(): ColumnHelper<TData> {
  return {
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