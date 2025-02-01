import { useMemo, useEffect } from "react";
import type { TableState } from "@/types/table.types";
import type { Column } from "@/types/column.types";
import type { TableEventMap, ServerSideConfig } from "@/types/events.types";
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
  isLoading?: boolean;
  serverSide?: ServerSideConfig<T>;
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
  isLoading,
  serverSide,
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
    initialState: {
      ...initialState,
      loading: isLoading || serverSide?.loading,
    },
    onStateChange,
    enableFuzzySearch,
    fuzzySearchKeys,
    fuzzySearchThreshold,
    columnResizeMode,
    debounceMs,
  });

  useEffect(() => {
    updateState((current) => ({
      ...current,
      loading: isLoading || serverSide?.loading,
    }));
  }, [isLoading, serverSide?.loading, updateState]);

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
    // If server-side is enabled, don't process data locally
    if (serverSide?.enabled) {
      return state.data;
    }

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
  }, [state, columns, debouncedFilterValue, enableFuzzySearch, fuse, serverSide?.enabled]);

  // Handle server-side pagination
  useEffect(() => {
    if (serverSide?.enabled && serverSide.onFetch) {
      const fetchData = async () => {
        try {
          const newData = await serverSide.onFetch({
            page: serverSide.currentPage,
            pageSize: serverSide.pageSize,
            sortColumn: state.sortColumn,
            sortDirection: state.sortDirection,
            filters: state.filterValue ? { search: state.filterValue } : undefined,
          });
          setData(newData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }
  }, [serverSide?.enabled, serverSide?.currentPage, serverSide?.pageSize, state.sortColumn, state.sortDirection, state.filterValue, setData, serverSide]);


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

    // Server-side config
    serverSide,
  };
}

// Export the hook for use in components
export const useTable = useTableContext;
