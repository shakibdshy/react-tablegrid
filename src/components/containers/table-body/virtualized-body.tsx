import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { tableStyles } from '@/styles/table.style'
import { TableRow } from '@/components/core/table-row/table-row'
import { useTable } from '@/context/table-context'

interface VirtualizationConfig {
  enabled: boolean
  rowHeight: number
  overscan: number
  scrollingDelay?: number
}

interface VirtualizedBodyProps {
  className?: string
  style?: React.CSSProperties
  config: VirtualizationConfig
  customRender?: {
    row?: typeof TableRow
  }
}

export function VirtualizedBody<T extends Record<string, unknown>>({
  className,
  style,
  config,
  customRender,
}: VirtualizedBodyProps) {
  const styles = tableStyles()
  const containerRef = useRef<HTMLDivElement>(null)
  const { filteredData } = useTable<T>()

  const [state, setState] = useState({
    startIndex: 0,
    endIndex: 0,
    visibleItems: 0,
    scrollTop: 0,
  })

  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current || !config.enabled) return

    const { height: containerHeight } = containerRef.current.getBoundingClientRect()
    const visibleItems = Math.ceil(containerHeight / config.rowHeight)
    const totalItems = filteredData.length
    const scrollTop = containerRef.current.scrollTop

    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / config.rowHeight) - config.overscan
    )
    const endIndex = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + containerHeight) / config.rowHeight) + config.overscan
    )

    setState({ startIndex, endIndex, visibleItems, scrollTop })
  }, [config.enabled, config.rowHeight, config.overscan, filteredData.length])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !config.enabled) return

    const handleScroll = () => {
      if (config.scrollingDelay) {
        window.requestAnimationFrame(calculateVisibleRange)
      } else {
        calculateVisibleRange()
      }
    }

    container.addEventListener('scroll', handleScroll)
    calculateVisibleRange()

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [calculateVisibleRange, config.enabled, config.scrollingDelay])

  const getVirtualItems = useCallback(() => {
    if (!config.enabled) {
      return filteredData.map((item, index) => ({
        item,
        index,
        style: {
          position: 'absolute' as const,
          top: 0,
          width: '100%',
          height: config.rowHeight,
        },
      }))
    }

    return filteredData
      .slice(state.startIndex, state.endIndex + 1)
      .map((item, index) => ({
        item,
        index: state.startIndex + index,
        style: {
          position: 'absolute' as const,
          top: (state.startIndex + index) * config.rowHeight,
          width: '100%',
          height: config.rowHeight,
        },
      }))
  }, [
    config.enabled,
    config.rowHeight,
    filteredData,
    state.startIndex,
    state.endIndex,
  ])

  const RowComponent = customRender?.row || TableRow
  const virtualItems = getVirtualItems()
  const totalHeight = filteredData.length * config.rowHeight

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto", className)}
      style={{ height: '100%', ...style }}
    >
      <div
        className={cn("relative", styles.body())}
        style={{ height: totalHeight }}
      >
        {virtualItems.map((virtualItem) => (
          <RowComponent
            key={`row-${virtualItem.index}-${
              (virtualItem.item as { id?: string }).id || ''
            }`}
            row={virtualItem.item}
            rowIndex={virtualItem.index}
            isVirtual
            virtualStyle={virtualItem.style}
          />
        ))}
      </div>
    </div>
  )
}
