"use client";

import {
  forwardRef,
  useMemo,
  useState,
  type ReactNode,
  useCallback,
  useEffect,
} from "react";
import { Empty, EmptyProductBoxIcon } from "@/components/ui/empty";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { cn } from "@/utils/cn";
import { tableStyles } from "./styles";
import type { 
  TableProps, 
  Column, 
  UpdateDataFn, 
  HeaderGroup, 
  TableState 
} from "./types";
import Fuse from "fuse.js";
import { Input } from "../input";
import CaretDown from "@/components/icons/caret-down";
import CaretUp from "@/components/icons/caret-up";
import { useVirtualization } from './virtualization-manager'
import { useServerState } from './server-state-manager'

// Helper function to type-check row data access
const getRowValue = <T extends Record<string, unknown>>(
  row: T,
  accessorKey: keyof T
): T[keyof T] => row[accessorKey];

const generateHeaderGroups = <T extends Record<string, unknown>>(
  columns: Column<T>[]
): HeaderGroup<T>[] => {
  const groupMap = new Map<string, Column<T>[]>();

  columns.forEach((column) => {
    if (column.group) {
      if (!groupMap.has(column.group)) {
        groupMap.set(column.group, []);
      }
      groupMap.get(column.group)!.push(column);
    }
  });

  return Array.from(groupMap.entries()).map(([name, groupColumns]) => ({
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    columns: groupColumns,
  }));
};

/**
 * TableGrid Component
 * A flexible and feature-rich table component with support for:
 * - Column resizing
 * - Column pinning
 * - Column visibility
 * - Sorting
 * - Filtering
 * - RTL/LTR support
 * - Header groups
 * 
 * @template T - Type of data being displayed in the table
 */
function TableGridComponent<T extends Record<string, unknown>>(
  props: TableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    columns,
    data,
    variant,
    className,
    sortColumn,
    sortDirection,
    gridTemplateColumns = "1fr",
    maxHeight = "400px",
    onRowChange,
    onRowDelete,
    meta,
    filterValue: externalFilterValue,
    onFilterChange,
    enableFiltering = false,
    enableFuzzySearch = false,
    fuzzySearchKeys,
    fuzzySearchThreshold = 0.3,
    components,
    styleConfig,
    renderHeader: customRenderHeader,
    renderCell: customRenderCell,
    renderEmpty: customRenderEmpty,
    renderLoading: customRenderLoading,
    renderSearch: customRenderSearch,
    isLoading = false,
    columnResizeDirection,
    onColumnSizingChange,
    columnResizeInfo,
    virtualization,
    serverSide,
    events,
  } = props;

  const styles = tableStyles({ variant });
  const filterValue = externalFilterValue ?? "";

  const [state, updateState] = useState<TableState<T>>({
    data,
    sortColumn: sortColumn ?? columns[0]?.id ?? ("" as keyof T),
    sortDirection: sortDirection ?? "asc",
    filterValue: "",
    visibleColumns: columns.map(col => col.id),
    pinnedColumns: { left: [], right: [] },
    columnSizing: { columnSizes: {} },
    columnResizeMode: 'onChange'
  });

  // Fuzzy search setup
  const fuse = useMemo(() => {
    if (!enableFuzzySearch) return null;
    const searchKeys = (
      fuzzySearchKeys || columns.map((col) => col.accessorKey)
    ).map((key) => String(key)) as string[];
    return new Fuse(data, {
      keys: searchKeys,
      threshold: fuzzySearchThreshold,
    });
  }, [data, enableFuzzySearch, fuzzySearchKeys, columns, fuzzySearchThreshold]);

  // Filter data based on search type
  const filteredData = useMemo(() => {
    if (!filterValue) return data;

    if (enableFuzzySearch && fuse) {
      return fuse.search(filterValue).map((result) => result.item);
    }

    if (enableFiltering) {
      return data.filter((row) => {
        return columns.some((column) => {
          const cellValue = getRowValue(row, column.accessorKey);
          if (cellValue == null) return false;
          return String(cellValue)
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      });
    }

    return data;
  }, [data, filterValue, columns, enableFiltering, enableFuzzySearch, fuse]);

  const headerGroups = useMemo(() => {
    if (!props.headerGroups) return [];
    return generateHeaderGroups(columns);
  }, [columns, props.headerGroups]);

  // Add resize info state
  const [resizeInfo, setResizeInfo] = useState(columnResizeInfo);

  // Add this state to track drag state
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Handles the start of a column resize operation
   * @param columnId - ID of the column being resized
   * @param startX - Initial X coordinate of the resize operation
   */
  const handleResizeStart = useCallback(
    (columnId: string, startX: number) => {
      setIsDragging(true);
      const headerCell = document.querySelector(
        `[data-column-id="${columnId}"]`
      );
      const currentWidth = headerCell?.getBoundingClientRect().width || 0;

      // Ensure we have a valid width before starting resize
      if (currentWidth > 0) {
        setResizeInfo({
          isResizingColumn: columnId,
          startX,
          currentX: startX,
          deltaX: 0,
          columnSizingStart: {
            [columnId]: currentWidth,
          },
        });
      }
    },
    [props.columnSizing]
  );

  /**
   * Handles the column resize movement
   * @param currentX - Current X coordinate during resize
   */
  const handleResizeMove = useCallback(
    (currentX: number) => {
      if (!isDragging || !resizeInfo?.isResizingColumn) return;

      const columnId = resizeInfo.isResizingColumn;
      const startWidth = resizeInfo.columnSizingStart[columnId];
      
      // Only proceed if we have valid start width
      if (startWidth) {
        const deltaX = currentX - (resizeInfo.startX ?? 0);
        const newWidth = Math.max(startWidth + deltaX, 50);

        onColumnSizingChange?.({
          columnSizes: {
            ...props.columnSizing?.columnSizes,
            [columnId]: newWidth,
          },
        });

        // Update resize info to track current position
        setResizeInfo(prev => ({
          ...prev!,
          currentX,
          deltaX,
          startX: prev!.startX,
          isResizingColumn: prev!.isResizingColumn,
          columnSizingStart: prev!.columnSizingStart
        }));
      }
    },
    [isDragging, resizeInfo, onColumnSizingChange, props.columnSizing]
  );

  /**
   * Handles the end of a column resize operation
   * Cleans up resize state and finalizes column width
   */
  const handleResizeEnd = useCallback(() => {
    if (resizeInfo?.isResizingColumn) {
      const finalWidth = props.columnSizing?.columnSizes[resizeInfo.isResizingColumn];
      if (finalWidth) {
        onColumnSizingChange?.({
          columnSizes: {
            ...props.columnSizing?.columnSizes,
            [resizeInfo.isResizingColumn]: finalWidth,
          },
        });
      }
    }
    
    setIsDragging(false);
    setResizeInfo({
      startX: null,
      currentX: null,
      deltaX: null,
      isResizingColumn: false,
      columnSizingStart: {},
    });
  }, [resizeInfo, props.columnSizing, onColumnSizingChange]);

  // Update event listeners
  useEffect(() => {
    if (resizeInfo?.isResizingColumn) {
      const handleMove = (e: MouseEvent | TouchEvent) => {
        const currentX = "touches" in e ? e.touches[0].clientX : e.clientX;
        handleResizeMove(currentX);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleResizeEnd);
      window.addEventListener("touchmove", handleMove as EventListener);
      window.addEventListener("touchend", handleResizeEnd);

      return () => {
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleResizeEnd);
        window.removeEventListener("touchmove", handleMove as EventListener);
        window.removeEventListener("touchend", handleResizeEnd);
      };
    }
  }, [resizeInfo, handleResizeMove, handleResizeEnd]);

  /**
   * Renders the header cell content for a column
   * @param column - Column configuration object
   * @returns ReactNode representing the header cell content
   */
  const renderHeader = (column: Column<T>): ReactNode => {
    if (customRenderHeader) {
      return customRenderHeader(column);
    }

    const columnWidth = props.columnSizing?.columnSizes[String(column.id)];

    return (
      <div
        data-column-id={String(column.id)}
        style={{ width: columnWidth ? `${columnWidth}px` : undefined }}
        className="flex items-center justify-between group relative"
      >
        <div className="flex-1 overflow-hidden">
          {typeof column.header === "function"
            ? column.header()
            : column.header}
          {column.sortable && (
            <button
              onClick={() => handleSort(column)}
              className={styles.sortButton()}
              aria-label="Sort"
              type="button"
            >
              {sortColumn === column.id ? (
                sortDirection === "asc" ? (
                  <CaretUp className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <CaretDown className="w-3.5 h-3.5 text-gray-400" />
                )
              ) : (
                <CaretDown className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          )}
        </div>

        <div
          className={cn(
            styles.resizer(),
            columnResizeDirection === "rtl" ? "rtl" : "ltr",
            isDragging && "cursor-col-resize"
          )}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleResizeStart(String(column.id), e.clientX);
          }}
        />
      </div>
    );
  };

  const renderCell = (
    column: Column<T>,
    row: T,
    rowIndex: number
  ): ReactNode => {
    if (customRenderCell) {
      return customRenderCell(
        column,
        row,
        getRowValue(row, column.accessorKey)
      );
    }

    if (components?.Cell) {
      return (
        <components.Cell
          column={column}
          row={row}
          value={getRowValue(row, column.accessorKey)}
        />
      );
    }

    if (column.cell) {
      const defaultUpdateData: UpdateDataFn<T> = () => undefined;
      const updateData = meta?.updateData || onRowChange || defaultUpdateData;

      return column.cell({
        value: getRowValue(row, column.accessorKey),
        row,
        onChange: (value) => {
          updateData(rowIndex, column.accessorKey, value);
        },
        onDelete: () => onRowDelete?.(rowIndex),
        table: meta && {
          options: {
            meta: {
              updateData,
            },
          },
        },
      });
    }
    return String(getRowValue(row, column.accessorKey));
  };

  const renderEmptyState = () => {
    if (customRenderEmpty) {
      return customRenderEmpty();
    }

    if (components?.EmptyState) {
      return <components.EmptyState />;
    }

    // Default empty state
    return (
      <Empty
        image={<EmptyProductBoxIcon />}
        text="No data found"
        className="mx-auto w-full"
      />
    );
  };

  const renderLoadingState = () => {
    if (customRenderLoading) {
      return customRenderLoading();
    }

    if (components?.LoadingState) {
      return <components.LoadingState />;
    }

    // Default loading state
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white" />
      </div>
    );
  };

  /**
   * Calculates the grid template columns CSS value based on column widths
   * @returns String representing the grid-template-columns CSS value
   */
  const getGridTemplateColumns = useCallback(() => {
    return columns
      .map((column) => {
        const width = props.columnSizing?.columnSizes[String(column.id)];
        return width ? `${width}px` : "1fr";
      })
      .join(" ");
  }, [columns, props.columnSizing]);

  // Initialize server-side state
  const serverState = useServerState(
    serverSide ?? { enabled: false, totalRows: 0, pageSize: 10, currentPage: 0, loading: false, onFetch: async () => [] },
    state
  )

  // Use server state data if enabled
  const displayData = serverSide?.enabled ? serverState.data : filteredData;

  // Update virtualization to use server data when enabled
  const {
    containerRef,
    virtualItems,
    totalHeight,
  } = useVirtualization(displayData, {
    enabled: !!virtualization?.enabled,
    rowHeight: virtualization?.rowHeight ?? 40,
    overscan: virtualization?.overscan ?? 3,
    scrollingDelay: virtualization?.scrollingDelay,
  })

  // Add event handlers
  const handleStateChange = useCallback(
    (newState: Partial<TableState<T>>) => {
      updateState(current => ({ ...current, ...newState }))
      events?.onStateChange?.(state)
    },
    [events, state, updateState]
  )

  // Update the render logic to use virtualization
  const renderRows = () => {
    if (virtualization?.enabled) {
      return (
        <div
          style={{ height: totalHeight, position: 'relative' }}
          className={styles.body()}
        >
          {virtualItems.map((virtualItem) => (
            <div
              key={`row-${virtualItem.index}`}
              className={styles.row()}
              style={{
                ...virtualItem.style,
                gridTemplateColumns: getGridTemplateColumns(),
              }}
              onClick={() => events?.onRowSelect?.(virtualItem.item, virtualItem.index)}
            >
              {columns.map((column) => {
                const columnWidth =
                  props.columnSizing?.columnSizes[String(column.id)];
                return (
                  <div
                    key={`cell-${String(column.id)}`}
                    className={cn(styles.cell(), column.className)}
                    style={{
                      width: columnWidth
                        ? `${columnWidth}px`
                        : undefined,
                      minWidth: columnWidth
                        ? `${columnWidth}px`
                        : undefined,
                    }}
                  >
                    {renderCell(column, virtualItem.item, virtualItem.index)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )
    }

    // Existing row rendering logic for non-virtualized mode
    return (
      <div className={styles.body()}>
        {isLoading
          ? renderLoadingState()
          : filteredData.length > 0
          ? filteredData.map((row, rowIndex) => (
              <div
                key={`row-${rowIndex}-${
                  (row as { id?: string }).id || ""
                }`}
                className={styles.row()}
                style={{ gridTemplateColumns: getGridTemplateColumns() }}
              >
                {columns.map((column) => {
                  const columnWidth =
                    props.columnSizing?.columnSizes[String(column.id)];
                  return (
                    <div
                      key={`cell-${String(column.id)}`}
                      className={cn(styles.cell(), column.className)}
                      style={{
                        width: columnWidth
                          ? `${columnWidth}px`
                          : undefined,
                        minWidth: columnWidth
                          ? `${columnWidth}px`
                          : undefined,
                      }}
                    >
                      {renderCell(column, row, rowIndex)}
                    </div>
                  );
                })}
              </div>
            ))
          : renderEmptyState()}
      </div>
    )
  }

  const handleSort = useCallback((column: Column<T>) => {
    const newDirection = state.sortColumn === column.id && state.sortDirection === "asc" ? "desc" : "asc";
    handleStateChange({
      sortColumn: column.id,
      sortDirection: newDirection,
    })
  }, [state.sortColumn, state.sortDirection, handleStateChange])

  const setFilterValue = useCallback((value: string) => {
    handleStateChange({ filterValue: value })
  }, [updateState])

  return (
    <div ref={ref} className="space-y-4">
      {(enableFiltering || enableFuzzySearch) && (
        <div
          className={cn(
            styles.searchContainer(),
            styleConfig?.searchContainer?.className
          )}
          style={styleConfig?.searchContainer?.style}
        >
          {customRenderSearch ? (
            customRenderSearch({
              value: filterValue,
              onChange: (value) => {
                setFilterValue(value);
                onFilterChange?.(value);
              },
              placeholder: enableFuzzySearch ? "Fuzzy search..." : "Search...",
            })
          ) : components?.SearchInput ? (
            <components.SearchInput
              value={filterValue}
              onChange={(value) => {
                setFilterValue(value);
                onFilterChange?.(value);
              }}
              placeholder={enableFuzzySearch ? "Fuzzy search..." : "Search..."}
            />
          ) : (
            <Input
              type="text"
              value={filterValue}
              onChange={(e) => {
                const newValue = e.target.value;
                setFilterValue(newValue);
                onFilterChange?.(newValue);
              }}
              placeholder={enableFuzzySearch ? "Fuzzy search..." : "Search..."}
              className={styles.searchInput()}
            />
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className={cn(styles.wrapper(), className)}
        style={{ height: virtualization?.enabled ? '400px' : undefined }}
      >
        <SimpleBar
          style={{ maxHeight }}
          className={styles.scrollContainer()}
          autoHide={false}
        >
          <div className={styles.table()}>
            <div className={styles.header()}>
              {props.headerGroups && headerGroups.length > 0 && (
                <div
                  className={styles.headerRow()}
                  style={{ gridTemplateColumns }}
                >
                  {headerGroups.map((group) => (
                    <div
                      key={group.id}
                      className={cn(
                        styles.headerCell(),
                        "text-center font-bold",
                        `colspan-${group.columns.length}`
                      )}
                      style={{
                        gridColumn: `span ${group.columns.length}`,
                      }}
                    >
                      {group.name}
                    </div>
                  ))}
                </div>
              )}

              <div
                className={styles.headerRow()}
                style={{ gridTemplateColumns: getGridTemplateColumns() }}
              >
                {columns.map((column) => {
                  const columnWidth = props.columnSizing?.columnSizes[String(column.id)];
                  
                  return (
                    <div
                      key={String(column.id)}
                      data-column-id={String(column.id)}
                      className={cn(
                        styles.headerCell(),
                        column.className,
                        "group relative"
                      )}
                      style={{ width: columnWidth ? `${columnWidth}px` : undefined }}
                    >
                      {renderHeader(column)}
                      <div
                        className={cn(
                          styles.resizer(),
                          columnResizeDirection === "rtl" ? "rtl" : "ltr",
                          isDragging && "cursor-col-resize"
                        )}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleResizeStart(String(column.id), e.clientX);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {renderRows()}
          </div>
        </SimpleBar>
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint, @typescript-eslint/no-explicit-any
const TableGrid = forwardRef(TableGridComponent) as unknown as (<T extends any>(
  props: TableProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => ReactNode) & { displayName?: string };

TableGrid.displayName = "TableGrid";

export type { TableProps, Column };
export default TableGrid;
