import { useMemo } from "react";
import type { TableState } from "@/types/table.types";
import type { Column } from "@/types/column.types";
import type { TableEventMap } from "@/types/events.types";
import { useTableState } from "./use-table-state";
import { useTableEvents } from "./use-table-events";
import { processTableData } from "@/utils/table-helper";

interface UseTableContextOptions<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  initialState?: Partial<TableState<T>>;
  onStateChange?: (state: TableState<T>) => void;
  events?: Partial<TableEventMap<T>>;
  enableFuzzySearch?: boolean;
  fuzzySearchKeys?: Array<keyof T>;
  fuzzySearchThreshold?: number;
  columnResizeMode?: "onChange" | "onResize";
  debounceMs?: number;
}

/**
 * Main hook for table functionality
 * Combines state and event management
 */
export function useTableContext<T extends Record<string, unknown>>({
  data,
  columns,
  initialState,
  onStateChange,
  events,
  enableFuzzySearch,
  fuzzySearchKeys,
  fuzzySearchThreshold,
  columnResizeMode,
  debounceMs,
}: UseTableContextOptions<T>) {
  // Initialize table state
  const {
    state,
    updateState,
    resetState,
    setData,
    updateColumnSizing,
    columnResizeInfo,
    handleColumnResizeStart,
    handleColumnResizeMove,
    handleColumnResizeEnd,
    columnResizeMode: currentResizeMode,
    columnResizeDirection,
    debouncedFilterValue,
    fuse,
  } = useTableState({
    data,
    columns,
    initialState,
    onStateChange,
    enableFuzzySearch,
    fuzzySearchKeys,
    fuzzySearchThreshold,
    columnResizeMode,
    debounceMs,
  });

  // Initialize event handlers
  const {
    handleSort,
    handleFilterChange,
    handleColumnResize,
    handleColumnVisibilityChange,
    handleColumnPin,
    handleRowSelect,
    handleStateChange,
  } = useTableEvents({
    state,
    updateState,
    events,
  });

  // Process table data (sorting, filtering)
  const filteredData = useMemo(() => {
    let processed = state.data;

    // Apply fuzzy search if enabled
    if (debouncedFilterValue && enableFuzzySearch && fuse) {
      processed = fuse
        .search(debouncedFilterValue)
        .map((result) => result.item);
    } else {
      // Use regular processTableData for non-fuzzy search
      processed = processTableData(processed, state, columns);
    }

    return processed;
  }, [state, columns, debouncedFilterValue, enableFuzzySearch, fuse]);

  return {
    // State
    state,
    columns,
    data: state.data,
    filteredData,

    // Column management
    visibleColumns: state.visibleColumns,
    toggleColumnVisibility: handleColumnVisibilityChange,
    pinnedColumns: state.pinnedColumns,
    toggleColumnPin: handleColumnPin,

    // Sorting
    sortColumn: state.sortColumn,
    sortDirection: state.sortDirection,
    handleSort,

    // Filtering
    filterValue: state.filterValue ?? "",
    setFilterValue: (value: string) => handleFilterChange(value, filteredData),

    // Column resizing
    columnSizing: state.columnSizing,
    columnResizeInfo,
    columnResizeMode: currentResizeMode,
    columnResizeDirection,
    handleColumnResize,
    handleColumnResizeStart,
    handleColumnResizeMove,
    handleColumnResizeEnd,
    updateColumnSizing,

    // Row management
    handleRowSelect,

    // State management
    resetState,
    setData,
    handleStateChange,
  };
}

// Export the hook for use in components
export const useTable = useTableContext;
