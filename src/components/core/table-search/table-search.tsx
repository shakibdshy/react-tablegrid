import { useCallback } from "react";
import { cn } from "@/utils/cn";
import { tableStyles } from "@/styles/table.style";
import { Input } from "@/components/ui/input";
import type { useTableGrid } from "@/hooks/use-table-grid";

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
      <div className={cn("rtg-table-search-container", styles.searchContainer(), className)} style={style}>
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
      <div className={cn("rtg-table-search-container", styles.searchContainer(), className)} style={style}>
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
    <div className={cn("rtg-table-search-container", styles.searchContainer(), className)} style={style}>
      <Input
        type="text"
        value={filterValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={cn(styles.searchInput(), searchInputClassName)}
      />
    </div>

  );
}
