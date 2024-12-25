"use client"

import { forwardRef, useMemo, useState, type ReactNode } from "react"
import { PiCaretDownFill, PiCaretUpFill } from "react-icons/pi"
import { Empty, EmptyProductBoxIcon } from "@/components/ui/empty"
import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"
import { cn } from "@/utils/cn"
import { tableStyles } from "./styles"
import type { TableProps, Column, UpdateDataFn } from "./types"
import Fuse from "fuse.js"
import { Input } from "../input"

// Helper function to type-check row data access
const getRowValue = <T extends Record<string, unknown>>(
  row: T,
  accessorKey: keyof T
): T[keyof T] => row[accessorKey]

// Helper function to organize columns by groups
const getHeaderGroups = <T extends Record<string, unknown>>(columns: Column<T>[]) => {
  const groups = columns.reduce((acc, column) => {
    const group = column.group || 'Ungrouped'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(column)
    return acc
  }, {} as Record<string, Column<T>[]>)

  return Object.entries(groups).map(([groupName, groupColumns]) => ({
    id: groupName,
    name: groupName,
    columns: groupColumns,
  }))
}

function TableGridComponent<T extends Record<string, unknown>>(
  props: TableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
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
    filterValue: externalFilterValue,
    onFilterChange,
    enableFiltering = false,
    headerGroups: externalHeaderGroups,
    enableFuzzySearch = false,
    fuzzySearchKeys,
    fuzzySearchThreshold = 0.3,
  } = props

  const styles = tableStyles({ variant })
  const [internalFilterValue, setInternalFilterValue] = useState("")
  const filterValue = externalFilterValue ?? internalFilterValue

  // Fuzzy search setup
  const fuse = useMemo(() => {
    if (!enableFuzzySearch) return null
    return new Fuse(data, {
      keys: fuzzySearchKeys || columns.map(col => col.accessorKey as string),
      threshold: fuzzySearchThreshold,
    })
  }, [data, enableFuzzySearch, fuzzySearchKeys, columns, fuzzySearchThreshold])

  // Filter data based on search type
  const filteredData = useMemo(() => {
    if (!filterValue) return data

    if (enableFuzzySearch && fuse) {
      return fuse.search(filterValue).map(result => result.item)
    }

    if (enableFiltering) {
      return data.filter((row) => {
        return columns.some((column) => {
          const cellValue = getRowValue(row, column.accessorKey)
          if (cellValue == null) return false
          return String(cellValue).toLowerCase().includes(filterValue.toLowerCase())
        })
      })
    }

    return data
  }, [data, filterValue, columns, enableFiltering, enableFuzzySearch, fuse])

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

  const headerGroups = externalHeaderGroups || (
    columns.some(col => col.group) ? getHeaderGroups(columns) : undefined
  )

  return (
    <div className="space-y-4">
      {(enableFiltering || enableFuzzySearch) && (
        <div className={styles.searchContainer()}>
          <Input
            type="text"
            value={filterValue}
            onChange={(e) => {
              const newValue = e.target.value
              setInternalFilterValue(newValue)
              onFilterChange?.(newValue)
            }}
            placeholder={enableFuzzySearch ? "Fuzzy search..." : "Search..."}
            className={styles.searchInput()}
          />
        </div>
      )}

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
    </div>
  )
}

const TableGrid = forwardRef(TableGridComponent) as unknown as (<T extends Record<string, unknown>>(
  props: TableProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => ReactNode) & { displayName?: string }

TableGrid.displayName = "TableGrid"

export type { TableProps, Column }
export default TableGrid
