import { useState, useMemo, useCallback, useEffect } from "react"
import type { Column, SortDirection, TableState } from "@/components/ui/table-grid/types"
import Fuse from "fuse.js"

interface TableGridOptions<T> {
  data: T[]
  columns: Column<T>[]
  initialState?: Partial<TableState<T>>
  onStateChange?: (state: TableState<T>) => void
  debounceMs?: number
  enableFuzzySearch?: boolean
  fuzzySearchKeys?: Array<keyof T & string>
  fuzzySearchThreshold?: number
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
  debounceMs = 300,
  enableFuzzySearch = false,
  fuzzySearchKeys,
  fuzzySearchThreshold = 0.3,
}: TableGridOptions<T>): TableGridReturn<T> {
  // Initialize state with defaults and initial values
  const [state, setState] = useState<TableState<T>>({
    data: initialData,
    sortColumn: initialState?.sortColumn ?? "",
    sortDirection: initialState?.sortDirection ?? "asc",
    filterValue: initialState?.filterValue ?? "",
  })

  // Initialize debounced filter value
  const [debouncedFilterValue, setDebouncedFilterValue] = useState(state.filterValue)

  // Setup debouncing for filter value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilterValue(state.filterValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [state.filterValue, debounceMs])

  // Initialize Fuse instance for fuzzy search
  const fuse = useMemo(() => {
    if (!enableFuzzySearch) return null
    return new Fuse(state.data, {
      keys: fuzzySearchKeys || columns.map(col => col.accessorKey as string),
      threshold: fuzzySearchThreshold,
    })
  }, [state.data, enableFuzzySearch, fuzzySearchKeys, columns, fuzzySearchThreshold])

  // Memoize the filtered and sorted data
  const filteredData = useMemo(() => {
    let processed = [...state.data]

    // Apply filtering
    if (debouncedFilterValue) {
      if (enableFuzzySearch && fuse) {
        // Use fuzzy search
        processed = fuse.search(debouncedFilterValue).map(result => result.item)
      } else {
        // Use regular search
        processed = processed.filter((row) =>
          columns.some((column) => {
            const cellValue = row[column.accessorKey]
            return cellValue != null && 
              String(cellValue)
                .toLowerCase()
                .includes(debouncedFilterValue.toLowerCase())
          })
        )
      }
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
  }, [
    state.data,
    debouncedFilterValue,
    state.sortColumn,
    state.sortDirection,
    columns,
    enableFuzzySearch,
    fuse
  ])

  // Update state and notify parent
  const updateState = useCallback((updates: Partial<TableState<T>>) => {
    const newState = { ...state, ...updates }
    setState(newState)
    onStateChange?.(newState)
  }, [state, onStateChange])

  // Handlers
  const handleSort = useCallback((column: Column<T>) => {
    const newDirection = 
      state.sortColumn === column.id && state.sortDirection === "asc" 
        ? "desc" 
        : "asc"
    
    updateState({
      sortColumn: column.id,
      sortDirection: newDirection,
    })
  }, [state.sortColumn, state.sortDirection, updateState])

  const setFilterValue = useCallback((value: string) => {
    updateState({ filterValue: value })
  }, [updateState])

  const setData = useCallback((data: T[]) => {
    updateState({ data })
  }, [updateState])

  const resetState = useCallback(() => {
    updateState({
      sortColumn: "",
      sortDirection: "asc",
      filterValue: "",
      data: initialData,
    })
  }, [initialData, updateState])

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