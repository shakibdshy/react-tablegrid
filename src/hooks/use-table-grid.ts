import { useState, useMemo, useCallback, useEffect } from "react"
import type { Column, SortDirection, TableState } from "@/components/ui/table-grid/types"
import Fuse from "fuse.js"
import type { IFuseOptions } from 'fuse.js';

interface TableGridOptions<T> {
  data: T[]
  columns: Column<T>[]
  initialState?: Partial<TableState<T>>
  onStateChange?: (state: TableState<T>) => void
  debounceMs?: number
  enableFuzzySearch?: boolean
  fuzzySearchKeys?: Array<keyof T>
  fuzzySearchThreshold?: number
}

interface TableGridReturn<T> {
  // Data
  data: T[]
  setData: (data: T[]) => void
  
  // Sorting
  sortColumn: keyof T
  sortDirection: SortDirection
  handleSort: (column: Column<T>) => void
  
  // Filtering
  filterValue: string
  setFilterValue: (value: string) => void
  filteredData: T[]
  
  // State
  state: TableState<T>
  resetState: () => void
  visibleColumns: Array<keyof T>
  toggleColumnVisibility: (columnId: keyof T) => void
  
  // Pinning
  pinnedColumns: {
    left: Array<keyof T>
    right: Array<keyof T>
  }
  toggleColumnPin: (columnId: keyof T, position: 'left' | 'right' | false) => void
}

export function useTableGrid<T>({
  data: initialData,
  columns,
  initialState,
  onStateChange,
  debounceMs = 300,
  enableFuzzySearch = false,
  fuzzySearchKeys,
  fuzzySearchThreshold = 0.3,
}: TableGridOptions<T>): TableGridReturn<T> {
  // Initialize state with pinned columns from both column definitions and initial state
  const [state, setState] = useState<TableState<T>>({
    data: initialData,
    sortColumn: initialState?.sortColumn ?? columns[0]?.id ?? ("" as keyof T),
    sortDirection: initialState?.sortDirection ?? "asc",
    filterValue: initialState?.filterValue ?? "",
    visibleColumns: initialState?.visibleColumns ?? columns.map(col => col.id),
    pinnedColumns: {
      left: initialState?.pinnedColumns?.left ?? 
        columns.filter(col => col.pinned === 'left').map(col => col.id),
      right: initialState?.pinnedColumns?.right ?? 
        columns.filter(col => col.pinned === 'right').map(col => col.id),
    },
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
      keys: (fuzzySearchKeys || columns.map(col => col.accessorKey))
        .map(key => String(key)) as IFuseOptions<T>['keys'],
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
      sortColumn: "" as keyof T,
      sortDirection: "asc",
      filterValue: "",
      data: initialData,
    })
  }, [initialData, updateState])

  // Add toggle column visibility handler
  const toggleColumnVisibility = useCallback((columnId: keyof T) => {
    updateState({
      visibleColumns: state.visibleColumns.includes(columnId)
        ? state.visibleColumns.filter(id => id !== columnId)
        : [...state.visibleColumns, columnId]
    });
  }, [state.visibleColumns, updateState]);

  // Add toggle column pin handler
  const toggleColumnPin = useCallback((columnId: keyof T, position: 'left' | 'right' | false) => {
    updateState({
      pinnedColumns: {
        left: position === 'left' 
          ? [...state.pinnedColumns.left, columnId]
          : state.pinnedColumns.left.filter(id => id !== columnId),
        right: position === 'right'
          ? [...state.pinnedColumns.right, columnId]
          : state.pinnedColumns.right.filter(id => id !== columnId),
      }
    });
  }, [state.pinnedColumns, updateState]);

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
    visibleColumns: state.visibleColumns,
    toggleColumnVisibility,
    
    // Pinning
    pinnedColumns: state.pinnedColumns,
    toggleColumnPin,
  }
} 