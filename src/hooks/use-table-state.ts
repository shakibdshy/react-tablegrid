import { useState, useCallback, useEffect, useMemo } from 'react'
import type { TableState } from '@/types/table.types'
import type { Column, ColumnResizeInfoState } from '@/types/column.types'
import { createInitialTableState } from '@/utils/table-helper'
import Fuse from 'fuse.js'
import { useDirection } from '@/hooks/use-direction'

interface UseTableStateOptions<T> {
  data: T[]
  columns: Column<T>[]
  initialState?: Partial<TableState<T>>
  onStateChange?: (state: TableState<T>) => void
  debounceMs?: number
  enableFuzzySearch?: boolean
  fuzzySearchKeys?: Array<keyof T>
  fuzzySearchThreshold?: number
  columnResizeMode?: 'onChange' | 'onResize'
}

/**
 * Hook for managing table state
 * Handles state updates and initialization
 */
export function useTableState<T extends Record<string, unknown>>({
  data,
  columns,
  initialState,
  onStateChange,
  debounceMs = 300,
  enableFuzzySearch = false,
  fuzzySearchKeys,
  fuzzySearchThreshold = 0.3,
  columnResizeMode = 'onChange',
}: UseTableStateOptions<T>) {
  const { direction } = useDirection()

  // Initialize state with default values and initial state
  const [state, setState] = useState<TableState<T>>(() => ({
    ...createInitialTableState(data, columns),
    ...initialState,
  }))

  // Initialize debounced filter value
  const [debouncedFilterValue, setDebouncedFilterValue] = useState(state.filterValue)

  // Initialize column resize info state
  const [columnResizeInfo, setColumnResizeInfo] = useState<ColumnResizeInfoState>({
    startX: null,
    currentX: null,
    deltaX: null,
    isResizingColumn: false,
    columnSizingStart: {},
  })

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
        .map(key => String(key)),
      threshold: fuzzySearchThreshold,
    })
  }, [state.data, enableFuzzySearch, fuzzySearchKeys, columns, fuzzySearchThreshold])

  /**
   * Updates table state and notifies parent of changes
   */
  const updateState = useCallback((
    updates: Partial<TableState<T>> | ((current: TableState<T>) => TableState<T>)
  ) => {
    setState(current => {
      const newState = typeof updates === 'function' 
        ? updates(current)
        : { ...current, ...updates }
      onStateChange?.(newState)
      return newState
    })
  }, [onStateChange])

  /**
   * Resets table state to initial values
   */
  const resetState = useCallback(() => {
    const defaultState = createInitialTableState(data, columns)
    setState(defaultState)
    onStateChange?.(defaultState)
  }, [data, columns, onStateChange])

  /**
   * Updates data in table state
   */
  const setData = useCallback((newData: T[]) => {
    updateState({ data: newData })
  }, [updateState])

  /**
   * Toggles column visibility
   */
  const toggleColumnVisibility = useCallback((columnId: keyof T) => {
    updateState((current: TableState<T>) => ({
      ...current,
      visibleColumns: current.visibleColumns.includes(columnId)
        ? current.visibleColumns.filter((id: keyof T) => id !== columnId)
        : [...current.visibleColumns, columnId]
    }))
  }, [updateState])

  /**
   * Toggles column pin position
   */
  const toggleColumnPin = useCallback((columnId: keyof T, position: 'left' | 'right' | false) => {
    updateState((current: TableState<T>) => ({
      ...current,
      pinnedColumns: {
        left: position === 'left'
          ? [...current.pinnedColumns.left, columnId]
          : current.pinnedColumns.left.filter((id: keyof T) => id !== columnId),
        right: position === 'right'
          ? [...current.pinnedColumns.right, columnId]
          : current.pinnedColumns.right.filter((id: keyof T) => id !== columnId),
      }
    }))
  }, [updateState])

  /**
   * Updates column sizing
   */
  const updateColumnSizing = useCallback((columnId: string, width: number) => {
    updateState((current: TableState<T>) => ({
      ...current,
      columnSizing: {
        columnSizes: {
          ...current.columnSizing.columnSizes,
          [columnId]: width
        }
      }
    }))
  }, [updateState])

  /**
   * Handles column resize start
   */
  const handleColumnResizeStart = useCallback((columnId: string, startX: number) => {
    const headerCell = document.querySelector(`[data-column-id="${columnId}"]`)
    const currentWidth = headerCell?.getBoundingClientRect().width || 0

    if (currentWidth > 0) {
      setColumnResizeInfo({
        startX,
        currentX: startX,
        deltaX: 0,
        isResizingColumn: columnId,
        columnSizingStart: {
          [columnId]: currentWidth,
        },
      })
    }
  }, [])

  /**
   * Handles column resize move
   */
  const handleColumnResizeMove = useCallback((currentX: number) => {
    if (!columnResizeInfo.isResizingColumn) return

    const columnId = columnResizeInfo.isResizingColumn
    const startWidth = columnResizeInfo.columnSizingStart[columnId]
    const deltaX = currentX - (columnResizeInfo.startX ?? 0)
    const newWidth = Math.max(startWidth + deltaX, 50)

    updateColumnSizing(columnId, newWidth)
    setColumnResizeInfo(prev => ({
      ...prev,
      currentX,
      deltaX,
    }))
  }, [columnResizeInfo, updateColumnSizing])

  /**
   * Handles column resize end
   */
  const handleColumnResizeEnd = useCallback(() => {
    setColumnResizeInfo({
      startX: null,
      currentX: null,
      deltaX: null,
      isResizingColumn: false,
      columnSizingStart: {},
    })
  }, [])

  return {
    state,
    updateState,
    resetState,
    setData,
    toggleColumnVisibility,
    toggleColumnPin,
    updateColumnSizing,
    columnResizeInfo,
    handleColumnResizeStart,
    handleColumnResizeMove,
    handleColumnResizeEnd,
    columnResizeMode,
    columnResizeDirection: direction as 'ltr' | 'rtl',
    debouncedFilterValue,
    fuse,
  }
}
