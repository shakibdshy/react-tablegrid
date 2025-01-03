import type { ReactNode } from "react"
import { UpdateDataFn } from "./table.types"

/**
 * Defines the structure of a table column
 * @template T - Type of data being displayed in the table
 */
export interface Column<T> {
  /** Unique identifier for the column */
  id: keyof T
  /** Header content or function to render header */
  header: ReactNode | (() => ReactNode)
  /** Key to access data in row object */
  accessorKey: keyof T
  /** Whether the column is sortable */
  sortable?: boolean
  /** Additional CSS classes for the column */
  className?: string
  /** Width of the column */
  width?: string
  /** Group name for the column */
  group?: string
  /** Pin position for the column */
  pinned?: 'left' | 'right' | false
  /** Custom cell renderer */
  cell?: (props: {
    value: T[keyof T]
    row: T
    onChange?: (value: T[keyof T]) => void
    onDelete?: () => void
    table?: {
      options: {
        meta: {
          updateData: UpdateDataFn<T>
        }
      }
    }
  }) => ReactNode
}

export interface HeaderGroup<T> {
  id: string
  name: string
  columns: Column<T>[]
}

/**
 * Configuration for column resizing functionality
 */
export interface ColumnResizeInfoState {
  /** Starting X coordinate of resize operation */
  startX: number | null
  /** Current X coordinate during resize */
  currentX: number | null
  /** Change in X coordinate from start */
  deltaX: number | null
  /** ID of column being resized or false if none */
  isResizingColumn: string | false
  /** Initial widths of columns when resize started */
  columnSizingStart: { [key: string]: number }
}

export type ColumnResizeMode = 'onChange' | 'onResize' 