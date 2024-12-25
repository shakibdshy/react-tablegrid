import { useState, useMemo } from "react"
import type { Column, SortDirection } from "@/components/ui/table-grid"

interface TableState<T> {
  data: T[]
  sortColumn: string
  sortDirection: SortDirection
  filterValue?: string
}

interface TableGridOptions<T> {
  data: T[]
  columns: Column<T>[]
  initialState?: Partial<TableState<T>>
  onStateChange?: (state: TableState<T>) => void
}

interface TableGridReturn<T> {
  // Data
  data: T[]
  setData: (data: T[]) => void
  
  // Sorting
  sortColumn: string
  sortDirection: SortDirection
  handleSort: (column: Column<T>) => void
  
  // Filtering
  filterValue: string
  setFilterValue: (value: string) => void
  filteredData: T[]
  
  // State
  state: TableState<T>
  resetState: () => void
}

export function useTableGrid<T extends Record<string, unknown>>({
  data: initialData,
  columns,
  initialState,
  onStateChange,
}: TableGridOptions<T>): TableGridReturn<T> {
  // Initialize state with defaults and initial values
  const [state, setState] = useState<TableState<T>>({
    data: initialData,
    sortColumn: initialState?.sortColumn ?? "",
    sortDirection: initialState?.sortDirection ?? "asc",
    filterValue: initialState?.filterValue ?? "",
  })

  // Memoize the filtered and sorted data
  const filteredData = useMemo(() => {
    let processed = [...state.data]

    // Apply filtering
    if (state.filterValue) {
      processed = processed.filter((row) =>
        columns.some((column) => {
          const cellValue = row[column.accessorKey]
          return cellValue != null && 
            String(cellValue)
              .toLowerCase()
              .includes(state.filterValue!.toLowerCase())
        })
      )
    }

    // Apply sorting
    if (state.sortColumn) {
      const sortColumn = columns.find((col) => col.id === state.sortColumn)
      if (sortColumn) {
        processed.sort((a, b) => {
          const aValue = String(a[sortColumn.accessorKey])
          const bValue = String(b[sortColumn.accessorKey])
          
          return state.sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        })
      }
    }

    return processed
  }, [state.data, state.filterValue, state.sortColumn, state.sortDirection, columns])

  // Update state and notify parent
  const updateState = (updates: Partial<TableState<T>>) => {
    const newState = { ...state, ...updates }
    setState(newState)
    onStateChange?.(newState)
  }

  // Handlers
  const handleSort = (column: Column<T>) => {
    const newDirection = 
      state.sortColumn === column.id && state.sortDirection === "asc" 
        ? "desc" 
        : "asc"
    
    updateState({
      sortColumn: column.id,
      sortDirection: newDirection,
    })
  }

  const setFilterValue = (value: string) => {
    updateState({ filterValue: value })
  }

  const setData = (data: T[]) => {
    updateState({ data })
  }

  const resetState = () => {
    updateState({
      sortColumn: "",
      sortDirection: "asc",
      filterValue: "",
      data: initialData,
    })
  }

  return {
    // Data management
    data: state.data,
    setData,
    
    // Sorting
    sortColumn: state.sortColumn,
    sortDirection: state.sortDirection,
    handleSort,
    
    // Filtering
    filterValue: state.filterValue ?? "",
    setFilterValue,
    filteredData,
    
    // State management
    state,
    resetState,
  }
} 