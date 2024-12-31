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
import type { TableProps, Column, UpdateDataFn, HeaderGroup } from "./types";
import Fuse from "fuse.js";
import { Input } from "../input";
import CaretDown from "@/components/icons/caret-down";
import CaretUp from "@/components/icons/caret-up";

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

function TableGridComponent<T extends Record<string, unknown>>(
  props: TableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const {
    columns,
    data,
    variant,
    className,
    onSort,
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
  } = props;

  const styles = tableStyles({ variant });
  const [internalFilterValue, setInternalFilterValue] = useState("");
  const filterValue = externalFilterValue ?? internalFilterValue;

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

  // Update resize handlers
  const handleResizeStart = useCallback(
    (columnId: string, startX: number) => {
      setIsDragging(true);
      const currentWidth = props.columnSizing?.columnSizes[columnId] || 100;

      // Initialize column width immediately if not set
      if (!props.columnSizing?.columnSizes[columnId]) {
        onColumnSizingChange?.({
          columnSizes: {
            ...props.columnSizing?.columnSizes,
            [columnId]: currentWidth,
          },
        });
      }

      // Set resize info with current width
      setResizeInfo({
        isResizingColumn: columnId,
        startX,
        currentX: startX,
        deltaX: 0,
        columnSizingStart: {
          [columnId]: currentWidth,
        },
      });
    },
    [props.columnSizing, onColumnSizingChange]
  );

  const handleResizeMove = useCallback(
    (currentX: number) => {
      if (!isDragging || !resizeInfo?.isResizingColumn) return;

      const deltaX = currentX - (resizeInfo.startX ?? 0);
      const columnId = resizeInfo.isResizingColumn;
      const startWidth = resizeInfo.columnSizingStart[columnId] || 100;
      const newWidth = Math.max(startWidth + deltaX, 20);

      onColumnSizingChange?.({
        columnSizes: {
          ...props.columnSizing?.columnSizes,
          [columnId]: newWidth,
        },
      });
    },
    [isDragging, resizeInfo, onColumnSizingChange, props.columnSizing]
  );

  const handleResizeEnd = useCallback(() => {
    setIsDragging(false);
    setResizeInfo({
      startX: null,
      currentX: null,
      deltaX: null,
      isResizingColumn: false,
      columnSizingStart: {},
    });
  }, []);

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

  const renderHeader = (column: Column<T>): ReactNode => {
    if (customRenderHeader) {
      return customRenderHeader(column);
    }

    const columnWidth = props.columnSizing?.columnSizes[String(column.id)];

    return (
      <div
        className="flex items-center justify-between group relative"
        style={{ width: columnWidth ? `${columnWidth}px` : undefined }}
      >
        <div className="flex-1 overflow-hidden">
          {typeof column.header === "function"
            ? column.header()
            : column.header}
          {column.sortable && renderSortIcon(column)}
        </div>

        <div
          className={cn(
            styles.resizer(),
            columnResizeDirection === "rtl" ? "rtl" : "ltr"
          )}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const columnId = String(column.id);
            const startX = e.clientX;

            // Set initial width synchronously
            if (!props.columnSizing?.columnSizes[columnId]) {
              onColumnSizingChange?.({
                columnSizes: {
                  ...props.columnSizing?.columnSizes,
                  [columnId]: 100,
                },
              });
            }

            handleResizeStart(columnId, startX);
          }}
        />
      </div>
    );
  };

  const renderSortIcon = (column: Column<T>): ReactNode => {
    if (!column.sortable) return null;

    return (
      <button
        onClick={() => onSort?.(column)}
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

  const getGridTemplateColumns = useCallback(() => {
    return columns
      .map((column) => {
        const width = props.columnSizing?.columnSizes[String(column.id)];
        return width ? `${width}px` : "1fr";
      })
      .join(" ");
  }, [columns, props.columnSizing]);

  return (
    <div className="space-y-4">
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
                setInternalFilterValue(value);
                onFilterChange?.(value);
              },
              placeholder: enableFuzzySearch ? "Fuzzy search..." : "Search...",
            })
          ) : components?.SearchInput ? (
            <components.SearchInput
              value={filterValue}
              onChange={(value) => {
                setInternalFilterValue(value);
                onFilterChange?.(value);
              }}
              placeholder={enableFuzzySearch ? "Fuzzy search..." : "Search..."}
            />
          ) : (
            // Default search input
            <Input
              type="text"
              value={filterValue}
              onChange={(e) => {
                const newValue = e.target.value;
                setInternalFilterValue(newValue);
                onFilterChange?.(newValue);
              }}
              placeholder={enableFuzzySearch ? "Fuzzy search..." : "Search..."}
              className={styles.searchInput()}
            />
          )}
        </div>
      )}

      <div
        ref={ref}
        className={cn(
          styles.wrapper(),
          styleConfig?.container?.className,
          className
        )}
        style={styleConfig?.container?.style}
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
                {columns.map((column) => (
                  <div
                    key={String(column.id)}
                    className={cn(styles.headerCell(), column.className)}
                  >
                    {renderHeader(column)}
                  </div>
                ))}
              </div>
            </div>

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
