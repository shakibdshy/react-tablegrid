"use client"

import { forwardRef, useMemo, useState, type ReactNode } from "react"
import { PiCaretDownFill, PiCaretUpFill } from "react-icons/pi"
import { Empty, EmptyProductBoxIcon } from "@/components/ui/empty"
import SimpleBar from "simplebar-react"
import "simplebar-react/dist/simplebar.min.css"
import { cn } from "@/utils/cn"
import { tableStyles } from "./styles"
import type { TableProps, Column, UpdateDataFn, HeaderGroup } from "./types"
import Fuse from "fuse.js"
import { Input } from "../input"

// Helper function to type-check row data access
const getRowValue = <T extends Record<string, unknown>>(
  row: T,
  accessorKey: keyof T
): T[keyof T] => row[accessorKey]

const generateHeaderGroups = <T extends Record<string, unknown>>(
  columns: Column<T>[]
): HeaderGroup<T>[] => {
  const groupMap = new Map<string, Column<T>[]>();
  
  columns.forEach(column => {
    if (column.group) {
      if (!groupMap.has(column.group)) {
        groupMap.set(column.group, []);
      }
      groupMap.get(column.group)!.push(column);
    }
  });

  return Array.from(groupMap.entries()).map(([name, groupColumns]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    columns: groupColumns
  }));
};

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

  const headerGroups = useMemo(() => {
    if (!props.headerGroups) return [];
    return generateHeaderGroups(columns);
  }, [columns, props.headerGroups]);

  const renderHeader = (column: Column<T>): ReactNode => {
    if (typeof column.header === 'function') {
      return column.header();
    }
    return column.header;
  };

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
              {props.headerGroups && headerGroups.length > 0 && (
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
              )}

              <div className={styles.headerRow()} style={{ gridTemplateColumns }}>
                {/* Left Pinned Columns */}
                {columns.filter(col => col.pinned === 'left').map((column) => (
                  <div
                    key={`pin-left-${column.id}`}
                    className={cn(
                      styles.headerCell(),
                      'sticky left-0 z-20 bg-gray-100 dark:bg-gray-700',
                      column.className,
                      column.width && `w-[${column.width}]`
                    )}
                  >
                    {renderHeader(column)}
                    {renderSortIcon(column)}
                  </div>
                ))}

                {/* Unpinned Columns */}
                {columns.filter(col => !col.pinned).map((column) => (
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

                {/* Right Pinned Columns */}
                {columns.filter(col => col.pinned === 'right').map((column) => (
                  <div
                    key={`pin-right-${column.id}`}
                    className={cn(
                      styles.headerCell(),
                      'sticky right-0 z-20 bg-gray-100 dark:bg-gray-700',
                      column.className,
                      column.width && `w-[${column.width}]`
                    )}
                  >
                    {renderHeader(column)}
                    {renderSortIcon(column)}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.body()}>
              {filteredData.length > 0 ? (
                filteredData.map((row, rowIndex) => (
                  <div
                    key={`row-${rowIndex}-${(row as { id?: string }).id || ""}`}
                    className={styles.row()}
                    style={{ gridTemplateColumns }}
                  >
                    {/* Left Pinned Cells */}
                    {columns.filter(col => col.pinned === 'left').map((column) => (
                      <div
                        key={`pin-left-${column.id}`}
                        className={cn(
                          styles.cell(),
                          'sticky left-0 z-10 bg-white dark:bg-gray-800',
                          column.className,
                          column.width && `w-[${column.width}]`
                        )}
                      >
                        {renderCell(column, row, rowIndex)}
                      </div>
                    ))}

                    {/* Unpinned Cells */}
                    {columns.filter(col => !col.pinned).map((column) => (
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

                    {/* Right Pinned Cells */}
                    {columns.filter(col => col.pinned === 'right').map((column) => (
                      <div
                        key={`pin-right-${column.id}`}
                        className={cn(
                          styles.cell(),
                          'sticky right-0 z-10 bg-white dark:bg-gray-800',
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
