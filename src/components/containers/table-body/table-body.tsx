import { cn } from '@/utils/cn'
import { tableStyles } from '@/styles/table.style'
import { TableRow } from '@/components/core/table-row/table-row'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Empty } from '@/components/ui/empty'
import type { useTableGrid } from '@/hooks/use-table-grid'

interface TableBodyProps<T extends Record<string, unknown>> {
  className?: string
  style?: React.CSSProperties
  tableInstance: ReturnType<typeof useTableGrid<T>>
  components?: {
    EmptyState?: React.ComponentType
    LoadingState?: React.ComponentType
  }
  customRender?: {
    empty?: () => React.ReactNode
    loading?: () => React.ReactNode
    row?: (props: { row: T; rowIndex: number }) => React.ReactNode
  }
}

export function TableBody<T extends Record<string, unknown>>({
  className,
  style,
  tableInstance,
  components,
  customRender,
}: TableBodyProps<T>) {
  const styles = tableStyles()
  const {
    filteredData,
    state: { loading },
  } = tableInstance;

  if (loading) {
    if (customRender?.loading) {
      return customRender.loading()
    }

    if (components?.LoadingState) {
      return <components.LoadingState />
    }

    return (
      <div 
        className={cn("flex items-center justify-center p-8", className)} 
        style={style}
      >
        <LoadingSpinner />
      </div>
    )
  }

  if (filteredData.length === 0) {
    if (customRender?.empty) {
      return customRender.empty()
    }

    if (components?.EmptyState) {
      return <components.EmptyState />
    }

    return (
      <div 
        className={cn("flex items-center justify-center p-8", className)} 
        style={style}
      >
        <Empty text="No data found" />
      </div>
    )
  }

  const RowComponent = customRender?.row || TableRow

  return (
    <div className={cn(styles.body(), className)} style={style}>
      {filteredData.map((row: T, index: number) => (
        <RowComponent
          key={`row-${index}-${(row as { id?: string }).id || ''}`}
          row={row}
          rowIndex={index}
          tableInstance={tableInstance}
        />
      ))}
    </div>
  )
}
