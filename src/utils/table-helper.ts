import type { Column } from "@/types/column.types"
import type { TableState, SortDirection } from "@/types/table.types"

/**
 * Helper functions for table operations and data manipulation
 */

/**
 * Sorts table data based on column and direction
 * @template T - Type of data being sorted
 * @param data - Array of data to sort
 * @param column - Column to sort by
 * @param direction - Sort direction
 * @returns Sorted array
 */
export function sortTableData<T>(
  data: T[],
  column: Column<T>,
  direction: SortDirection
): T[] {
  return [...data].sort((a, b) => {
    const aValue = String(a[column.accessorKey])
    const bValue = String(b[column.accessorKey])
    return direction === "asc"
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue)
  })
}

/**
 * Filters table data based on filter value and columns
 * @template T - Type of data being filtered
 * @param data - Array of data to filter
 * @param columns - Array of columns to search in
 * @param filterValue - Value to filter by
 * @returns Filtered array
 */
export function filterTableData<T>(
  data: T[],
  columns: Column<T>[],
  filterValue: string
): T[] {
  if (!filterValue) return data
  
  const lowercasedFilter = filterValue.toLowerCase()
  return data.filter((row) =>
    columns.some((column) => {
      const cellValue = row[column.accessorKey]
      return cellValue != null &&
        String(cellValue)
          .toLowerCase()
          .includes(lowercasedFilter)
    })
  )
}

/**
 * Gets the grid template columns CSS value based on column widths
 * @template T - Type of data in the table
 * @param columns - Array of columns
 * @param columnSizing - Column sizing configuration
 * @returns CSS grid-template-columns value
 */
export function getGridTemplateColumns<T>(
  columns: Column<T>[],
  columnSizing?: { columnSizes: { [key: string]: number } }
): string {
  return columns
    .map((column) => {
      const width = columnSizing?.columnSizes[String(column.id)]
      return width ? `${width}px` : "1fr"
    })
    .join(" ")
}

/**
 * Reorders columns based on pinned status
 * @template T - Type of data in the table
 * @param columns - Array of columns to reorder
 * @param pinnedColumns - Configuration of pinned columns
 * @returns Reordered array of columns
 */
export function reorderColumns<T>(
  columns: Column<T>[],
  pinnedColumns: { left: Array<keyof T>; right: Array<keyof T> }
): Column<T>[] {
  const leftPinned = columns.filter((col) => 
    pinnedColumns.left.includes(col.id)
  )
  const rightPinned = columns.filter((col) => 
    pinnedColumns.right.includes(col.id)
  )
  const unpinned = columns.filter(
    (col) => !pinnedColumns.left.includes(col.id) && !pinnedColumns.right.includes(col.id)
  )
  
  return [...leftPinned, ...unpinned, ...rightPinned]
}

/**
 * Groups columns by their group property
 * @template T - Type of data in the table
 * @param columns - Array of columns to group
 * @returns Object with grouped columns
 */
export function groupColumns<T>(
  columns: Column<T>[]
): { [key: string]: Column<T>[] } {
  return columns.reduce((groups, column) => {
    const group = column.group || 'ungrouped'
    return {
      ...groups,
      [group]: [...(groups[group] || []), column],
    }
  }, {} as { [key: string]: Column<T>[] })
}

/**
 * Calculates column width based on content
 * @template T - Type of data in the table
 * @param column - Column to calculate width for
 * @param data - Table data
 * @param minWidth - Minimum width in pixels
 * @returns Calculated width in pixels
 */
export function calculateColumnWidth<T>(
  column: Column<T>,
  data: T[],
  minWidth: number = 50
): number {
  const headerWidth = String(column.header).length * 8
  const maxContentWidth = Math.max(
    ...data.map((row) => String(row[column.accessorKey]).length * 8)
  )
  return Math.max(minWidth, headerWidth, maxContentWidth)
}

/**
 * Creates initial table state
 * @template T - Type of data in the table
 * @param data - Initial data
 * @param columns - Table columns
 * @returns Initial table state
 */
export function createInitialTableState<T>(
  data: T[],
  columns: Column<T>[]
): TableState<T> {
  return {
    data,
    sortColumn: columns[0]?.id ?? ("" as keyof T),
    sortDirection: "asc",
    filterValue: "",
    visibleColumns: columns.map(col => col.id),
    pinnedColumns: {
      left: columns.filter(col => col.pinned === 'left').map(col => col.id),
      right: columns.filter(col => col.pinned === 'right').map(col => col.id),
    },
    columnSizing: { columnSizes: {} },
    columnResizeMode: 'onChange'
  }
}

/**
 * Gets visible columns based on state
 * @template T - Type of data in the table
 * @param columns - All columns
 * @param visibleColumns - Array of visible column IDs
 * @returns Array of visible columns
 */
export function getVisibleColumns<T>(
  columns: Column<T>[],
  visibleColumns: Array<keyof T>
): Column<T>[] {
  return columns.filter(col => visibleColumns.includes(col.id))
}

/**
 * Processes table data through sorting and filtering
 * @template T - Type of data in the table
 * @param data - Raw table data
 * @param state - Current table state
 * @param columns - Table columns
 * @returns Processed data
 */
export function processTableData<T>(
  data: T[],
  state: TableState<T>,
  columns: Column<T>[]
): T[] {
  let processed = [...data]

  // Apply filtering
  if (state.filterValue) {
    processed = filterTableData(processed, columns, state.filterValue)
  }

  // Apply sorting
  const sortColumn = columns.find(col => col.id === state.sortColumn)
  if (sortColumn) {
    processed = sortTableData(processed, sortColumn, state.sortDirection)
  }

  return processed
}
