import { tv } from "tailwind-variants"
import { tableVariants, defaultVariant } from './variants'

/**
 * Core table styles using tailwind-variants
 * Organized by component type for better maintainability
 */

// Container styles
const containerStyles = {
  wrapper: "w-full relative overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg",
  scrollContainer: [
    "w-full overflow-auto relative",
    "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
    "dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800",
    "hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500",
  ],
  table: "w-full min-w-max relative isolate",
}

// Header styles
const headerStyles = {
  header: [
    "bg-gray-100 dark:bg-gray-700 sticky top-0 z-30",
    "after:absolute after:bottom-0 after:left-0 after:right-0",
    "after:h-px after:bg-gray-200 dark:after:bg-gray-600",
  ],
  headerRow: [
    "grid items-center",
    "relative",
    "isolate",
  ],
  headerCell: [
    "px-3 py-3",
    "bg-gray-100 dark:bg-gray-700 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-100",
    "relative",
    "[--header-bg:theme(colors.gray.100)] dark:[--header-bg:theme(colors.gray.700)]",
    "before:absolute before:inset-0 before:bg-[--header-bg] before:-z-10",
    "shadow-[0_0_0_1px_theme(colors.gray.200)] dark:shadow-[0_0_0_1px_theme(colors.gray.600)]",
  ],
  headerGroup: [
    "px-4 py-2 border-b border-gray-200 dark:border-gray-500",
    "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200",
    "sticky top-0 z-20",
  ],
}

// Body styles
const bodyStyles = {
  body: [
    "divide-y divide-gray-200 dark:divide-gray-700",
    "relative",
    "isolate",
  ],
  row: [
    "grid items-center",
    "hover:bg-gray-50/50 dark:hover:bg-gray-900/50",
    "transition-colors duration-200",
    "[--background:theme(colors.white)] dark:[--background:theme(colors.gray.800)]",
    "relative",
  ],
  cell: [
    "px-3 py-5",
    "text-sm text-gray-600 dark:text-gray-400",
    "overflow-hidden text-ellipsis whitespace-nowrap",
    "relative",
    "before:absolute before:inset-0 before:bg-[--background] before:-z-10",
    "shadow-[0_0_0_1px_theme(colors.gray.200)] dark:shadow-[0_0_0_1px_theme(colors.gray.600)]",
  ],
}

// Interactive element styles
const interactiveStyles = {
  resizer: [
    "absolute top-0 h-full w-4 cursor-col-resize select-none touch-none opacity-0",
    "group-hover:opacity-100",
    "hover:bg-blue-500/20 active:bg-blue-500/40",
    "[&.ltr]:right-0 [&.rtl]:left-0",
    "after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-gray-300",
    "z-50",
  ],
  resizerIndicator: [
    "fixed top-0 w-0.5 h-full bg-blue-500 z-50",
    "transition-transform",
    "[&.ltr]:translate-x-0 [&.rtl]:-translate-x-full",
  ],
  sortButton: "ms-2 inline-flex items-center gap-1",
}

// Utility styles
const utilityStyles = {
  empty: "text-center py-8",
  searchContainer: "mb-4",
  searchInput: "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
}

/**
 * Combined table styles with variants
 */
export const tableStyles = tv({
  slots: {
    ...containerStyles,
    ...headerStyles,
    ...bodyStyles,
    ...interactiveStyles,
    ...utilityStyles,
  },
  variants: {
    variant: tableVariants,
  },
  defaultVariants: {
    variant: defaultVariant,
  },
}) 