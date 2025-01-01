import { useState, useMemo, useCallback, useEffect } from "react"
import type { Column, SortDirection, TableState, ColumnResizeInfoState } from "@/components/ui/table-grid/types"
import Fuse from "fuse.js"
import type { IFuseOptions } from 'fuse.js';
import { useDirection } from "@/hooks/use-direction"

/**
 * Interface for table grid configuration options
 * @template T - Type of data being managed in the table
 */
interface TableGridOptions<T> {
  /** Array of data items to display in the table */
  data: T[]
  /** Array of column definitions */
  columns: Column<T>[]
  /** Initial state for the table */
  initialState?: Partial<TableState<T>>
  /** Callback when table state changes */
  onStateChange?: (state: TableState<T>) => void
  /** Debounce time in milliseconds for search input */
  debounceMs?: number
  /** Enable fuzzy search functionality */
  enableFuzzySearch?: boolean
  /** Keys to use for fuzzy search */
  fuzzySearchKeys?: Array<keyof T>
  /** Threshold for fuzzy search matching (0-1) */
  fuzzySearchThreshold?: number
  /** Mode for column resizing behavior */
  columnResizeMode?: 'onChange' | 'onResize'
}

/**
 * Hook return type containing all table functionality
 * @template T - Type of data being managed
 */
interface TableGridReturn<T> {
  // Data management
  /** Current table data */
  data: T[]
  /** Function to update table data */
  setData: (data: T[]) => void
  
  // Sorting functionality
  /** Currently sorted column */
  sortColumn: keyof T
  /** Current sort direction */
  sortDirection: SortDirection
  /** Handler for column sort events */
  handleSort: (column: Column<T>) => void
  
  // Filtering functionality
  /** Current filter value */
  filterValue: string
  /** Function to update filter value */
  setFilterValue: (value: string) => void
  /** Filtered and sorted data */
  filteredData: T[]
  
  // State management
  /** Current table state */
  state: TableState<T>
  /** Function to reset table state */
  resetState: () => void
  /** Currently visible columns */
  visibleColumns: Array<keyof T>
  /** Toggle column visibility */
  toggleColumnVisibility: (columnId: keyof T) => void
  
  // Column pinning
  /** Currently pinned columns */
  pinnedColumns: {
    left: Array<keyof T>
    right: Array<keyof T>
  }
  /** Toggle column pin state */
  toggleColumnPin: (columnId: keyof T, position: 'left' | 'right' | false) => void
  
  // Column resizing
  /** Column sizing state */
  columnSizing: {
    columnSizes: { [key: string]: number }
  }
  /** Handler for column resize */
  handleColumnResize: (columnId: string, width: number) => void
  /** Handler for resize start */
  handleColumnResizeStart: (columnId: string, startX: number) => void
  /** Handler for resize move */
  handleColumnResizeMove: (currentX: number) => void
  /** Handler for resize end */
  handleColumnResizeEnd: () => void
  /** Current resize state */
  columnResizeInfo: ColumnResizeInfoState
  /** Column resize mode */
  columnResizeMode: 'onChange' | 'onResize'
  /** Column resize direction */
  columnResizeDirection: 'ltr' | 'rtl'
}

/**
 * Custom hook for managing table grid state and functionality
 * Provides state management and handlers for:
 * - Sorting
 * - Filtering
 * - Column visibility
 * - Column pinning
 * - Column resizing
 * - Data management
 * 
 * @template T - Type of data being managed in the table
 * @param options - Configuration options for the table grid
 * @returns Object containing table state and handler functions
 */
export function useTableGrid<T>({
  data: initialData,
  columns,
  initialState,
  onStateChange,
  debounceMs = 300,
  enableFuzzySearch = false,
  fuzzySearchKeys,
  fuzzySearchThreshold = 0.3,
  columnResizeMode = 'onChange',
}: TableGridOptions<T>): TableGridReturn<T> {
  const { direction } = useDirection();
  
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
    columnSizing: {
      columnSizes: {},
    },
    columnResizeMode: columnResizeMode,
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

  /**
   * Updates table state and notifies parent of changes
   * @param updates - Partial state updates to apply
   */
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

  /**
   * Handles column visibility toggling
   * @param columnId - ID of the column to toggle visibility
   */
  const toggleColumnVisibility = useCallback((columnId: keyof T) => {
    updateState({
      visibleColumns: state.visibleColumns.includes(columnId)
        ? state.visibleColumns.filter(id => id !== columnId)
        : [...state.visibleColumns, columnId]
    });
  }, [state.visibleColumns, updateState]);

  /**
   * Handles column pinning/unpinning
   * @param columnId - ID of the column to pin/unpin
   * @param position - Position to pin the column ('left', 'right', or false for unpin)
   */
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

  // Add resize info state
  const [columnResizeInfo, setColumnResizeInfo] = useState<ColumnResizeInfoState>({
    startX: null,
    currentX: null,
    deltaX: null,
    isResizingColumn: false,
    columnSizingStart: {},
  });

  /**
   * Handles column resize operations
   * @param columnId - ID of the column being resized
   * @param width - New width for the column
   */
  const handleColumnResize = useCallback(
    (columnId: string, width: number) => {
      updateState({
        columnSizing: {
          columnSizes: {
            ...state.columnSizing.columnSizes,
            [columnId]: width
          },
        },
      });
    },
    [state.columnSizing.columnSizes, updateState]
  );

  /**
   * Handles the start of a column resize operation
   * @param columnId - ID of the column being resized
   * @param startX - Initial X coordinate of the resize
   */
  const handleColumnResizeStart = useCallback(
    (columnId: string, startX: number) => {
      const headerCell = document.querySelector(`[data-column-id="${columnId}"]`);
      const currentWidth = headerCell?.getBoundingClientRect().width;
      
      setColumnResizeInfo({
        startX,
        currentX: startX,
        deltaX: 0,
        isResizingColumn: columnId,
        columnSizingStart: { 
          [columnId]: currentWidth || state.columnSizing.columnSizes[columnId] || 0 
        }
      });
    },
    [state.columnSizing.columnSizes]
  );

  /**
   * Handles column resize movement
   * @param currentX - Current X coordinate during resize
   */
  const handleColumnResizeMove = useCallback(
    (currentX: number) => {
      if (!columnResizeInfo.isResizingColumn) return;

      const columnId = columnResizeInfo.isResizingColumn;
      const startWidth = columnResizeInfo.columnSizingStart[columnId];
      const deltaX = currentX - (columnResizeInfo.startX ?? 0);
      const newWidth = Math.max(startWidth + deltaX, 50);

      handleColumnResize(columnId, newWidth);
      setColumnResizeInfo(prev => ({
        ...prev,
        currentX,
        deltaX
      }));
    },
    [columnResizeInfo, handleColumnResize]
  );

  /**
   * Handles the end of a column resize operation
   * Resets resize state to initial values
   */
  const handleColumnResizeEnd = useCallback(() => {
    setColumnResizeInfo({
      startX: null,
      currentX: null,
      deltaX: null,
      isResizingColumn: false,
      columnSizingStart: {}
    });
  }, []);

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
    
    // Column resizing
    columnSizing: state.columnSizing,
    handleColumnResize,
    handleColumnResizeStart,
    handleColumnResizeMove,
    handleColumnResizeEnd,
    columnResizeInfo,
    columnResizeMode: state.columnResizeMode,
    columnResizeDirection: direction as 'ltr' | 'rtl',
  }
} 