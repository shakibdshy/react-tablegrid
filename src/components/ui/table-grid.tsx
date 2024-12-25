"use client"

import { forwardRef, useMemo } from "react"

import { PiCaretDownFill, PiCaretUpFill } from "react-icons/pi"
import { Empty, EmptyProductBoxIcon } from "@/components/ui/empty"
import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"
import { tv } from "tailwind-variants"

import { cn } from "@/utils/cn"

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
    headerCell:
      "px-3 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase",
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

type UpdateDataFn = (index: number, field: string, value: unknown) => void

export interface Column {
  id: string
  header: string | (() => React.ReactNode)
  accessorKey: string
  sortable?: boolean
  className?: string
  width?: string
  cell?: (props: {
    value: unknown
    onChange: (value: unknown) => void
    onDelete?: () => void
    row: {
      original: unknown
      index: number
    }
    table: {
      options: {
        meta: {
          updateData: UpdateDataFn
        }
      }
    }
  }) => React.ReactNode
}

export interface TableProps {
  columns: Column[]
  data: unknown[]
  variant?: "modern" | "minimal" | "classic"
  className?: string
  onSort?: (column: Column) => void
  sortColumn?: string
  sortDirection?: "asc" | "desc"
  gridTemplateColumns?: string
  maxHeight?: string
  onRowChange?: (index: number, field: string, value: unknown) => void
  onRowDelete?: (index: number) => void
  meta?: {
    updateData?: (index: number, field: string, value: unknown) => void
  }
  filterValue?: string
  onFilterChange?: (value: string) => void
  filterPlaceholder?: string
  enableFiltering?: boolean
}

const TableGrid = forwardRef<HTMLDivElement, TableProps>(
  (
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
      filterValue = '',
      enableFiltering = false,
    },
    ref
  ) => {
    const styles = tableStyles({ variant })

    const filteredData = useMemo(() => {
      if (!filterValue || !enableFiltering) return data

      return data.filter((row) => {
        return columns.some((column) => {
          const cellValue = (row as Record<string, unknown>)[column.accessorKey];
          if (cellValue == null) return false;
          return String(cellValue)
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      });
    }, [data, filterValue, columns, enableFiltering]);

    const renderHeader = (column: Column) => {
      if (typeof column.header === 'function') {
        return column.header()
      }
      return column.header
    }

    const renderSortIcon = (column: Column) => {
      if (!column.sortable) return null

      return (
        <button
          onClick={() => onSort?.(column)}
          className={styles.sortButton()}
          aria-label="Sort">
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

    const renderCell = (column: Column, row: unknown, rowIndex: number) => {
      if (column.cell) {
        const defaultUpdateData: UpdateDataFn = () => {}
        const updateData = meta?.updateData || onRowChange || defaultUpdateData

        return column.cell({
          value: (row as Record<string, unknown>)[column.accessorKey],
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
      return (row as Record<string, unknown>)[column.accessorKey]
    }

    return (
      <div ref={ref} className={cn(styles.wrapper(), className)}>
        <SimpleBar style={{ maxHeight }} className={styles.scrollContainer()}>
          <div className={styles.table()}>
            <div className={styles.header()}>
              <div
                className={styles.headerRow()}
                style={{ gridTemplateColumns }}>
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className={cn(
                      styles.headerCell(),
                      column.className,
                      column.width && `w-[${column.width}]`
                    )}>
                    {renderHeader(column)}
                    {renderSortIcon(column)}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.body()}>
              {Array.isArray(filteredData) && filteredData.length > 0 ? (
                filteredData.map((row: unknown, rowIndex: number) => (
                  <div
                    key={(row as { id?: string }).id || rowIndex}
                    className={styles.row()}
                    style={{ gridTemplateColumns }}>
                    {columns.map((column) => (
                      <div
                        key={column.id}
                        className={cn(
                          styles.cell(),
                          column.className,
                          column.width && `w-[${column.width}]`
                        )}>
                        {renderCell(column, row, rowIndex) as React.ReactNode}
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
)

TableGrid.displayName = "TableGrid"

export default TableGrid
