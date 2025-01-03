import { useCallback } from 'react'
import { cn } from '@/utils/cn'
import { tableStyles } from '@/styles/table.style'
import { Input } from '@/components/ui/input'
import { useTable } from '@/context/table-context'

interface TableSearchProps {
  className?: string
  style?: React.CSSProperties
  enableFuzzySearch?: boolean
  placeholder?: string
  components?: {
    SearchInput?: React.ComponentType<{
      value: string
      onChange: (value: string) => void
      placeholder?: string
    }>
  }
  customRender?: (props: {
    value: string
    onChange: (value: string) => void
    placeholder?: string
  }) => React.ReactNode
  onFilterChange?: (value: string) => void
}

export function TableSearch({
  className,
  style,
  enableFuzzySearch = false,
  placeholder,
  components,
  customRender,
  onFilterChange,
}: TableSearchProps) {
  const styles = tableStyles()
  const { filterValue, setFilterValue } = useTable()

  const handleChange = useCallback(
    (value: string) => {
      setFilterValue(value)
      onFilterChange?.(value)
    },
    [setFilterValue, onFilterChange]
  )

  const defaultPlaceholder = enableFuzzySearch ? 'Fuzzy search...' : 'Search...'

  // Custom render function takes precedence
  if (customRender) {
    return (
      <div className={cn(styles.searchContainer(), className)} style={style}>
        {customRender({
          value: filterValue,
          onChange: handleChange,
          placeholder: placeholder ?? defaultPlaceholder,
        })}
      </div>
    )
  }

  // Component render is second priority
  if (components?.SearchInput) {
    return (
      <div className={cn(styles.searchContainer(), className)} style={style}>
        <components.SearchInput
          value={filterValue}
          onChange={handleChange}
          placeholder={placeholder ?? defaultPlaceholder}
        />
      </div>
    )
  }

  // Default search input
  return (
    <div className={cn(styles.searchContainer(), className)} style={style}>
      <Input
        type="text"
        value={filterValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder ?? defaultPlaceholder}
        className={styles.searchInput()}
      />
    </div>
  )
}