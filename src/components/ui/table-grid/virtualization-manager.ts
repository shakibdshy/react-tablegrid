import { useCallback, useEffect, useRef, useState } from 'react'
import type { VirtualizationConfig } from './utility-types'

interface VirtualizationState {
  startIndex: number
  endIndex: number
  visibleItems: number
  scrollTop: number
}

interface VirtualItem<T> {
  item: T
  index: number
  style: {
    position: 'absolute'
    top: number
    width: string
    height: number
  }
}

export function useVirtualization<T>(
  data: T[],
  config: VirtualizationConfig
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<VirtualizationState>({
    startIndex: 0,
    endIndex: 0,
    visibleItems: 0,
    scrollTop: 0,
  })

  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return

    const { height: containerHeight } = containerRef.current.getBoundingClientRect()
    const visibleItems = Math.ceil(containerHeight / config.rowHeight)
    const totalItems = data.length
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
  }, [config.rowHeight, config.overscan, data.length])

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
    if (!config.enabled) return data.map(item => ({
      item,
      index: data.indexOf(item),
      style: {
        position: 'absolute' as const,
        top: 0,
        width: '100%',
        height: config.rowHeight,
      }
    }))

    return data.slice(state.startIndex, state.endIndex + 1).map((item, index) => ({
      item,
      index: state.startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (state.startIndex + index) * config.rowHeight,
        width: '100%',
        height: config.rowHeight,
      },
    }))
  }, [config.enabled, config.rowHeight, data, state.startIndex, state.endIndex])

  return {
    containerRef,
    virtualItems: getVirtualItems() as VirtualItem<T>[],
    totalHeight: data.length * config.rowHeight,
    startIndex: state.startIndex,
    endIndex: state.endIndex,
  }
} 