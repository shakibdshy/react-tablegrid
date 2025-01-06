import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { tableStyles } from '@/styles/table.style'
import { TableRow } from '@/components/core/table-row/table-row'
import type { useTable } from '@/hooks/use-table-context'

interface VirtualizationConfig {
  enabled: boolean
  rowHeight: number
  overscan: number
  scrollingDelay?: number
}

interface VirtualizedBodyProps<T extends Record<string, unknown>> {
  className?: string
  style?: React.CSSProperties
  config: VirtualizationConfig
  tableInstance: ReturnType<typeof useTable<T>>
  customRender?: {
    row?: typeof TableRow
  }
}

export function VirtualizedBody<T extends Record<string, unknown>>({
  className,
  style,
  config,
  tableInstance,
  customRender,
}: VirtualizedBodyProps<T>) {
  const styles = tableStyles()
  const containerRef = useRef<HTMLDivElement>(null)
  const { filteredData } = tableInstance
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const rafId = useRef<number | null>(null)

  const [state, setState] = useState({
    startIndex: 0,
    endIndex: 0,
    visibleItems: 0,
    scrollTop: 0,
    isScrolling: false
  })

  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current || !config.enabled) return

    const { height: containerHeight } = containerRef.current.getBoundingClientRect()
    const visibleItems = Math.ceil(containerHeight / config.rowHeight)
    const totalItems = filteredData.length
    const scrollTop = containerRef.current.scrollTop

    // Adjust overscan based on scroll speed
    const scrollSpeed = Math.abs(scrollTop - state.scrollTop)
    const dynamicOverscan = Math.min(
      config.overscan + Math.floor(scrollSpeed / 100),
      Math.floor(visibleItems / 2)
    )

    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / config.rowHeight) - dynamicOverscan
    )
    const endIndex = Math.min(
      totalItems - 1,
      Math.ceil((scrollTop + containerHeight) / config.rowHeight) + dynamicOverscan
    )

    setState(prev => ({ ...prev, startIndex, endIndex, visibleItems, scrollTop }))
  }, [config.enabled, config.rowHeight, config.overscan, filteredData.length, state.scrollTop])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !config.enabled) return

    const handleScroll = () => {
      setState(prev => ({ ...prev, isScrolling: true }))
      
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
      }

      scrollTimeout.current = setTimeout(() => {
        setState(prev => ({ ...prev, isScrolling: false }))
      }, config.scrollingDelay || 150)

      rafId.current = requestAnimationFrame(calculateVisibleRange)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    calculateVisibleRange()

    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current)
      }
    }
  }, [calculateVisibleRange, config.enabled, config.scrollingDelay])

  const getVirtualItems = useCallback(() => {
    if (!config.enabled) {
      return filteredData.map((item: T, index: number) => ({
        item,
        index,
        style: {
          position: 'absolute' as const,
          top: 0,
          left: 0,
          right: 0,
          height: config.rowHeight,
        },
      }))
    }

    return filteredData
      .slice(state.startIndex, state.endIndex + 1)
      .map((item: T, index: number) => ({
        item,
        index: state.startIndex + index,
        style: {
          position: 'absolute' as const,
          top: (state.startIndex + index) * config.rowHeight,
          left: 0,
          right: 0,
          height: config.rowHeight,
          transform: `translate3d(0, 0, 0)`, // Enable GPU acceleration
          willChange: state.isScrolling ? 'transform' : 'auto', // Optimize for scrolling
          backfaceVisibility: 'hidden', // Prevent flickering
          WebkitFontSmoothing: 'antialiased',
        },
      }))
  }, [
    config.enabled,
    config.rowHeight,
    filteredData,
    state.startIndex,
    state.endIndex,
    state.isScrolling
  ])

  const RowComponent = customRender?.row || TableRow
  const virtualItems = getVirtualItems()
  const totalHeight = filteredData.length * config.rowHeight

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
        "overscroll-none", // Prevent overscroll bounce
        className
      )}
      style={{ 
        height: '100%',
        ...style,
        overscrollBehavior: 'contain', // Prevent scroll chaining
        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
      }}
    >
      <div
        className={cn("relative will-change-transform", styles.body())}
        style={{ 
          height: totalHeight,
          contain: 'strict', // Optimize rendering
          contentVisibility: 'auto', // Optimize rendering of off-screen content
        }}
      >
        {virtualItems.map((virtualItem) => (
          <RowComponent
            key={`row-${virtualItem.index}-${
              (virtualItem.item as { id?: string }).id || virtualItem.index
            }`}
            row={virtualItem.item}
            rowIndex={virtualItem.index}
            isVirtual
            virtualStyle={virtualItem.style}
            tableInstance={tableInstance}
          />
        ))}
      </div>
    </div>
  )
}
