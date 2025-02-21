import { useCallback } from "react";
import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import type { useTableGrid } from "@/hooks/use-table-grid";
// import "./table-search.css";

interface TableSearchProps<T extends Record<string, unknown>> {
  className?: string;
  searchInputClassName?: string;
  tableInstance: ReturnType<typeof useTableGrid<T>>;
  style?: React.CSSProperties;
  placeholder?: string;
  components?: {
    SearchInput?: React.ComponentType<{
      value: string;
      onChange: (value: string) => void;
      placeholder?: string;
    }>;
  };
  customRender?: (props: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }) => React.ReactNode;
  onFilterChange?: (value: string) => void;
  withoutTailwind?: boolean;
  isLoading?: boolean;
  error?: string;
}

export function TableSearch<T extends Record<string, unknown>>({
  className,
  searchInputClassName,
  tableInstance,
  style,
  placeholder = "Search...",
  components,
  customRender,
  onFilterChange,
  withoutTailwind = false,
  isLoading = false,
  error,
}: TableSearchProps<T>) {
  const styles = tableStyles();
  const { filterValue, setFilterValue } = tableInstance;

  const handleChange = useCallback(
    (value: string) => {
      setFilterValue(value);
      onFilterChange?.(value);
    },
    [setFilterValue, onFilterChange]
  );

  // Custom render function takes precedence
  if (customRender) {
    return (
      <div 
        className={cn(
          withoutTailwind ? "rtg-search-container" : styles.searchContainer(),
          className
        )} 
        style={style}
      >
        {customRender({
          value: filterValue,
          onChange: handleChange,
          placeholder,
        })}
      </div>
    );
  }

  // Component render is second priority
  if (components?.SearchInput) {
    return (
      <div 
        className={cn(
          withoutTailwind ? "rtg-search-container" : styles.searchContainer(),
          className
        )} 
        style={style}
      >
        <components.SearchInput
          value={filterValue}
          onChange={handleChange}
          placeholder={placeholder}
        />
      </div>
    );
  }

  // Default search input
  return (
    <div 
      className={cn(
        withoutTailwind ? "rtg-search-container" : styles.searchContainer(),
        className
      )} 
      style={style}
      role="search"
    >
      <input
        type="text"
        value={filterValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          withoutTailwind 
            ? [
                "rtg-search-input",
                isLoading && "rtg-search-loading",
                error && "rtg-search-error"
              ]
            : [
                styles.searchInput(),
                searchInputClassName
              ]
        )}
        aria-label="Search table content"
        aria-controls="table-content"
        aria-describedby="search-description"
        disabled={isLoading}
      />
      <span id="search-description" className={withoutTailwind ? "rtg-sr-only" : "sr-only"}>
        Type to filter table content. Results will update as you type.
      </span>
      {error && (
        <div 
          className={withoutTailwind ? "rtg-search-error-message" : "text-red-600 text-sm mt-1"} 
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  );
}
