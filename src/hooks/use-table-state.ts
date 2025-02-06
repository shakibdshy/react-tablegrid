import { useState, useCallback, useEffect } from "react";
import type { TableState } from "@/types/table.types";
import type { Column, ColumnResizeInfoState } from "@/types/column.types";
import { createInitialTableState } from "@/utils/table-helper";

interface UseTableStateOptions<T> {
  data: T[];
  columns: Column<T>[];
  initialState?: Partial<TableState<T>>;
  onStateChange?: (state: TableState<T>) => void;
  debounceMs?: number;
  columnResizeMode?: "onChange" | "onResize";
  columnResizeDirection?: "ltr" | "rtl";
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
  columnResizeMode = "onChange",
  columnResizeDirection = "ltr",
}: UseTableStateOptions<T>) {
  // Initialize state with default values and initial state
  const [state, setState] = useState<TableState<T>>(() => ({
    ...createInitialTableState(data, columns),
    ...initialState,
  }));

  // Initialize debounced filter value
  const [debouncedFilterValue, setDebouncedFilterValue] = useState(
    state.filterValue
  );

  // Initialize column resize info state
  const [columnResizeInfo, setColumnResizeInfo] =
    useState<ColumnResizeInfoState>({
      startX: null,
      currentX: null,
      deltaX: null,
      isResizingColumn: false,
      columnSizingStart: {},
    });

  // Setup debouncing for filter value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilterValue(state.filterValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [state.filterValue, debounceMs]);

  /**
   * Updates table state and notifies parent of changes
   */
  const updateState = useCallback(
    (
      updates:
        | Partial<TableState<T>>
        | ((current: TableState<T>) => TableState<T>)
    ) => {
      setState((current) => {
        const newState =
          typeof updates === "function"
            ? updates(current)
            : { ...current, ...updates };
        if (JSON.stringify(current) !== JSON.stringify(newState)) {
          onStateChange?.(newState);
        }
        return newState;
      });
    },
    [onStateChange]
  );

  /**
   * Resets table state to initial values
   */
  const resetState = useCallback(() => {
    const defaultState = createInitialTableState(data, columns);
    setState(defaultState);
    onStateChange?.(defaultState);
  }, [data, columns, onStateChange]);

  /**
   * Updates data in table state
   */
  const setData = useCallback(
    (newData: T[]) => {
      updateState({ data: newData });
    },
    [updateState]
  );

  /**
   * Toggles column visibility
   */
  const toggleColumnVisibility = useCallback(
    (columnId: keyof T) => {
      updateState((current: TableState<T>) => ({
        ...current,
        visibleColumns: current.visibleColumns.includes(columnId)
          ? current.visibleColumns.filter((id: keyof T) => id !== columnId)
          : [...current.visibleColumns, columnId],
      }));
    },
    [updateState]
  );

  /**
   * Toggles column pin position
   */
  const toggleColumnPin = useCallback(
    (columnId: keyof T, position: "left" | "right" | false) => {
      updateState((current: TableState<T>) => ({
        ...current,
        pinnedColumns: {
          left:
            position === "left"
              ? [...current.pinnedColumns.left, columnId]
              : current.pinnedColumns.left.filter(
                  (id: keyof T) => id !== columnId
                ),
          right:
            position === "right"
              ? [...current.pinnedColumns.right, columnId]
              : current.pinnedColumns.right.filter(
                  (id: keyof T) => id !== columnId
                ),
        },
      }));
    },
    [updateState]
  );

  /**
   * Updates column sizing
   */
  const updateColumnSizing = useCallback(
    (columnId: string, width: number) => {
      updateState((current: TableState<T>) => ({
        ...current,
        columnSizing: {
          columnSizes: {
            ...current.columnSizing.columnSizes,
            [columnId]: width,
          },
        },
      }));
    },
    [updateState]
  );

  /**
   * Handles column resize start
   */
  const handleColumnResizeStart = useCallback(
    (columnId: string, startX: number) => {
      // Get current column width from state or DOM
      const currentWidth =
        state.columnSizing.columnSizes[columnId] ||
        document
          .querySelector(`[data-column-id="${columnId}"]`)
          ?.getBoundingClientRect().width ||
        100; // fallback width

      setColumnResizeInfo({
        startX,
        currentX: startX,
        deltaX: 0,
        isResizingColumn: columnId,
        columnSizingStart: {
          [columnId]: currentWidth,
        },
      });
    },
    [state.columnSizing.columnSizes]
  );

  /**
   * Handles column resize move
   * @param currentX - The current X position of the mouse/touch event
   * Updates the column width based on the resize drag movement
   * Constrains width between min/max values for usability
   */
  const handleColumnResizeMove = useCallback(
    (currentX: number) => {
      if (!columnResizeInfo.isResizingColumn) return;

      const columnId = columnResizeInfo.isResizingColumn;
      const startWidth = columnResizeInfo.columnSizingStart[columnId] || 0;
      const deltaX = currentX - (columnResizeInfo.startX ?? 0);

      // Constrain column width between minWidth (50px) and maxWidth (800px) to ensure
      // columns remain usable and don't grow too large
      const minWidth = 50;
      const maxWidth = 800;
      const newWidth = Math.min(
        Math.max(startWidth + deltaX, minWidth),
        maxWidth
      );

      updateColumnSizing(columnId, newWidth);
      setColumnResizeInfo((prev) => ({
        ...prev,
        currentX,
        deltaX,
      }));
    },
    [columnResizeInfo, updateColumnSizing]
  );

  const handleColumnResizeEnd = useCallback(() => {
    setColumnResizeInfo({
      startX: null,
      currentX: null,
      deltaX: null,
      isResizingColumn: false,
      columnSizingStart: {},
    });
  }, []);

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
    columnResizeDirection,
    debouncedFilterValue,
  };
}
