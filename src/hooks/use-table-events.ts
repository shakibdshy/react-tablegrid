import { useCallback } from 'react'
import type { TableState } from '@/types/table.types'
import type { Column } from '@/types/column.types'
import type { TableEventMap } from '@/types/events.types'

interface UseTableEventsOptions<T extends Record<string, unknown>> {
  state: TableState<T>
  updateState: (updates: Partial<TableState<T>>) => void
  events?: Partial<TableEventMap<T>>
}

/**
 * Hook for managing table events
 * Provides event handlers for table interactions
 */
export function useTableEvents<T extends Record<string, unknown>>({
  state,
  updateState,
  events,
}: UseTableEventsOptions<T>) {
  /**
   * Handles column sort
   */
  const handleSort = useCallback((column: Column<T>) => {
    const newDirection = 
      state.sortColumn === column.id && state.sortDirection === "asc" 
        ? "desc" 
        : "asc"
    
    updateState({
      sortColumn: column.id,
      sortDirection: newDirection,
    })

    events?.onSort?.(column, newDirection)
  }, [state.sortColumn, state.sortDirection, updateState, events])

  /**
   * Handles filter value changes
   */
  const handleFilterChange = useCallback((value: string, filteredData: T[]) => {
    updateState({ filterValue: value })
    events?.onFilter?.(value, filteredData)
  }, [updateState, events])

  /**
   * Handles column resize
   */
  const handleColumnResize = useCallback((columnId: keyof T, width: number) => {
    updateState({
      columnSizing: {
        columnSizes: {
          ...state.columnSizing.columnSizes,
          [String(columnId)]: width
        }
      }
    })
    events?.onColumnResize?.(columnId, width)
  }, [state.columnSizing.columnSizes, updateState, events])

  /**
   * Handles column visibility changes
   */
  const handleColumnVisibilityChange = useCallback((columnId: keyof T, isVisible: boolean) => {
    updateState({
      visibleColumns: isVisible
        ? [...state.visibleColumns, columnId]
        : state.visibleColumns.filter(id => id !== columnId)
    })
    events?.onColumnVisibilityChange?.(columnId, isVisible)
  }, [state.visibleColumns, updateState, events])

  /**
   * Handles column pinning
   */
  const handleColumnPin = useCallback((columnId: keyof T, position: 'left' | 'right' | false) => {
    updateState({
      pinnedColumns: {
        left: position === 'left'
          ? [...state.pinnedColumns.left, columnId]
          : state.pinnedColumns.left.filter(id => id !== columnId),
        right: position === 'right'
          ? [...state.pinnedColumns.right, columnId]
          : state.pinnedColumns.right.filter(id => id !== columnId),
      }
    })
    events?.onColumnPin?.(columnId, position)
  }, [state.pinnedColumns, updateState, events])

  /**
   * Handles row selection
   */
  const handleRowSelect = useCallback((row: T, index: number) => {
    events?.onRowSelect?.(row, index)
  }, [events])

  /**
   * Handles state changes
   */
  const handleStateChange = useCallback((newState: TableState<T>) => {
    events?.onStateChange?.(newState)
  }, [events])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey } = event;
    
    switch (key) {
      case 'ArrowDown':
        // Move selection down
        break;
      case 'ArrowUp':
        // Move selection up
        break;
      case 'Space':
        if (ctrlKey) {
          // Toggle current row selection
        }
        break;
      case 'a':
        if (ctrlKey) {
          // Select all rows
          event.preventDefault();
        }
        break;
    }
  }, []);

  return {
    handleSort,
    handleFilterChange,
    handleColumnResize,
    handleColumnVisibilityChange,
    handleColumnPin,
    handleRowSelect,
    handleStateChange,
    handleKeyDown,
  }
}
