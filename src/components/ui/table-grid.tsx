"use client"

import { forwardRef, useMemo, type ReactNode } from "react"
import { PiCaretDownFill, PiCaretUpFill } from "react-icons/pi"
import { Empty, EmptyProductBoxIcon } from "@/components/ui/empty"
import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"
import { tv } from "tailwind-variants"
import { cn } from "@/utils/cn"

// Define strict types for table variants
type TableVariant = "modern" | "minimal" | "classic"
type SortDirection = "asc" | "desc"

// Define table styles using tailwind-variants
const tableStyles = tv({
  slots: {
    wrapper: "w-full relative overflow-hidden",
    scrollContainer: [
      "w-full overflow-auto",
      "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
      "dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800",
      "hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500",
    ],
    table: "w-full min-w-max",
    header: "bg-gray-100 dark:bg-gray-700 sticky top-0 z-20 rounded-t-lg",
    headerRow: "grid items-center border-b border-dashed border-gray-500/20",
    headerCell: "px-3 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-100",
    body: "divide-y divide-dashed divide-gray-500/20",
    row: "grid items-center hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors",
    cell: "px-3 py-4 text-sm text-gray-600 dark:text-gray-400",
    empty: "text-center py-8",
    sortButton: "ms-2 inline-flex items-center gap-1",
  },
  variants: {
    variant: {
      modern: {
        wrapper: "rounded-lg border border-gray-500/20",
        headerCell: "first:rounded-tl-lg last:rounded-tr-lg",
      },
      minimal: {
        wrapper: "rounded-lg",
        headerCell: "first:rounded-tl-lg last:rounded-tr-lg",
      },
      classic: {
        wrapper: "border border-dashed border-gray-500/20",
      },
    },
  },
  defaultVariants: {
    variant: "modern",
  },
})

// Define strict types for data handling
type UpdateDataFn<T> = (index: number, field: keyof T, value: T[keyof T]) => void

// Define strict column interface
interface Column<T> {
  id: string
  header: string | (() => ReactNode)
  accessorKey: keyof T
  sortable?: boolean
  className?: string
  width?: string
  group?: string
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

// Add this interface before TableProps
interface HeaderGroup<T> {
  id: string
  name: string
  columns: Column<T>[]
}

// Define strict table props interface
interface TableProps<T extends Record<string, unknown>> {
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
  headerGroups?: HeaderGroup<T>[]
}

// Helper function to type-check row data access
const getRowValue = <T extends Record<string, unknown>>(
  row: T,
  accessorKey: keyof T
): T[keyof T] => row[accessorKey]

function TableGridComponent<T extends Record<string, unknown>>(
  {
    columns,
    data,
    variant,
    className,
    onSort,
    sortColumn,
    sortDirection,
    gridTemplateColumns = "1fr",
    maxHeight = "400px",
    onRowChange,
    onRowDelete,
    meta,
    filterValue = "",
    enableFiltering = false,
    headerGroups,
  }: TableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const styles = tableStyles({ variant })

  const filteredData = useMemo(() => {
    if (!filterValue || !enableFiltering) return data

    return data.filter((row) => {
      return columns.some((column) => {
        const cellValue = getRowValue(row, column.accessorKey)
        if (cellValue == null) return false
        return String(cellValue).toLowerCase().includes(filterValue.toLowerCase())
      })
    })
  }, [data, filterValue, columns, enableFiltering])

  const renderHeader = (column: Column<T>): ReactNode => {
    return typeof column.header === "function" ? column.header() : column.header
  }

  const renderSortIcon = (column: Column<T>): ReactNode => {
    if (!column.sortable) return null

    return (
      <button
        onClick={() => onSort?.(column)}
        className={styles.sortButton()}
        aria-label="Sort"
        type="button"
      >
        {sortColumn === column.id ? (
          sortDirection === "asc" ? (
            <PiCaretUpFill size={14} />
          ) : (
            <PiCaretDownFill size={14} />
          )
        ) : (
          <PiCaretDownFill size={14} className="text-gray-400" />
        )}
      </button>
    )
  }

  const renderCell = (column: Column<T>, row: T, rowIndex: number): ReactNode => {
    if (column.cell) {
      const defaultUpdateData: UpdateDataFn<T> = () => undefined
      const updateData = meta?.updateData || onRowChange || defaultUpdateData

      return column.cell({
        value: getRowValue(row, column.accessorKey),
        onChange: (value) => {
          updateData(rowIndex, column.accessorKey, value)
        },
        onDelete: () => onRowDelete?.(rowIndex),
        row: {
          original: row,
          index: rowIndex,
        },
        table: {
          options: {
            meta: {
              updateData,
            },
          },
        },
      })
    }
    return String(getRowValue(row, column.accessorKey))
  }

  const renderHeaders = () => {
    if (headerGroups) {
      return (
        <>
          <div className={styles.headerRow()} style={{ gridTemplateColumns }}>
            {headerGroups.map((group) => (
              <div
                key={group.id}
                className={cn(
                  styles.headerCell(),
                  "text-center font-bold",
                  `colspan-${group.columns.length}`
                )}
                style={{
                  gridColumn: `span ${group.columns.length}`
                }}
              >
                {group.name}
              </div>
            ))}
          </div>
          <div className={styles.headerRow()} style={{ gridTemplateColumns }}>
            {columns.map((column) => (
              <div
                key={column.id}
                className={cn(
                  styles.headerCell(),
                  column.className,
                  column.width && `w-[${column.width}]`
                )}
              >
                {renderHeader(column)}
                {renderSortIcon(column)}
              </div>
            ))}
          </div>
        </>
      )
    }

    return (
      <div className={styles.headerRow()} style={{ gridTemplateColumns }}>
        {columns.map((column) => (
          <div
            key={column.id}
            className={cn(
              styles.headerCell(),
              column.className,
              column.width && `w-[${column.width}]`
            )}
          >
            {renderHeader(column)}
            {renderSortIcon(column)}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className={cn(styles.wrapper(), className)}>
      <SimpleBar style={{ maxHeight }} className={styles.scrollContainer()}>
        <div className={styles.table()}>
          <div className={styles.header()}>
            {renderHeaders()}
          </div>

          <div className={styles.body()}>
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <div
                  key={`row-${rowIndex}-${(row as { id?: string }).id || ""}`}
                  className={styles.row()}
                  style={{ gridTemplateColumns }}
                >
                  {columns.map((column) => (
                    <div
                      key={`cell-${column.id}`}
                      className={cn(
                        styles.cell(),
                        column.className,
                        column.width && `w-[${column.width}]`
                      )}
                    >
                      {renderCell(column, row, rowIndex)}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <Empty
                image={<EmptyProductBoxIcon />}
                text="No data found"
                className="mx-auto w-full"
              />
            )}
          </div>
        </div>
      </SimpleBar>
    </div>
  )
}

const TableGrid = forwardRef(TableGridComponent) as unknown as (<T extends Record<string, unknown>>(
  props: TableProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => ReactNode) & { displayName?: string }

TableGrid.displayName = "TableGrid"

export type { TableProps, Column, UpdateDataFn, TableVariant, SortDirection, HeaderGroup }
export default TableGrid
