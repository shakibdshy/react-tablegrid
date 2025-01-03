import { cn } from '@/utils/cn'
import { tableStyles } from '@/styles/table.style'
import type { HeaderGroup } from '@/types/column.types'
import type { useTable } from '@/hooks/use-table-context'

interface TableHeaderGroupProps<T extends Record<string, unknown>> {
  className?: string
  style?: React.CSSProperties
  tableInstance: ReturnType<typeof useTable<T>>
  customRender?: {
    group: (group: HeaderGroup<T>) => React.ReactNode
  }
}

export function TableHeaderGroup<T extends Record<string, unknown>>({
  className,
  style,
  tableInstance,
  customRender,
}: TableHeaderGroupProps<T>) {
  const styles = tableStyles()
  const { columns } = tableInstance

  const headerGroups = columns.reduce((groups, column) => {
    if (column.group) {
      const existingGroup = groups.find(g => g.name === column.group)
      if (existingGroup) {
        existingGroup.columns.push(column)
      } else {
        groups.push({
          id: column.group.toLowerCase().replace(/\s+/g, '-'),
          name: column.group,
          columns: [column],
        })
      }
    }
    return groups
  }, [] as HeaderGroup<T>[])

  return (
    <div className={cn(styles.headerGroup(), className)} style={style}>
      {headerGroups.map((group) => (
        <div
          key={group.id}
          className={cn(
            styles.headerCell(),
            'text-center font-bold',
            `colspan-${group.columns.length}`
          )}
          style={{
            gridColumn: `span ${group.columns.length}`,
          }}
        >
          {customRender?.group ? customRender.group(group) : group.name}
        </div>
      ))}
    </div>
  )
}
