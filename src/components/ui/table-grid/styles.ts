import { tv } from "tailwind-variants"

/**
 * Table styles configuration using tailwind-variants
 * Provides consistent styling for:
 * - Table wrapper
 * - Header and cells
 * - Scrollbars
 * - Resizer elements
 * - Search container
 * - Loading and empty states
 */
export const tableStyles = tv({
  slots: {
    /** Container wrapper with border and rounded corners */
    wrapper: "w-full relative overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg",
    
    /** Scrollable container with custom scrollbar styling */
    scrollContainer: [
      "w-full overflow-auto",
      "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
      "dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800",
      "hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500",
    ],
    
    /** Main table element */
    table: "w-full min-w-max relative",
    
    /** Sticky header with bottom border */
    header: [
      "bg-gray-100 dark:bg-gray-700 sticky top-0 z-20",
      "after:absolute after:bottom-0 after:left-0 after:right-0",
      "after:h-px after:bg-gray-200 dark:after:bg-gray-600",
    ],
    
    /** Header row grid layout */
    headerRow: [
      "grid items-center",
      "relative",
    ],
    
    /** Individual header cell styling */
    headerCell: [
      "px-3 py-3",
      "text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-100",
      "relative",
    ],
    
    /** Table body with row dividers */
    body: "divide-y divide-gray-200 dark:divide-gray-700",
    
    /** Row styling with hover effects */
    row: [
      "grid items-center",
      "hover:bg-gray-50/50 dark:hover:bg-gray-900/50",
      "transition-colors duration-200",
    ],
    
    /** Cell styling with text overflow handling */
    cell: [
      "px-3 py-4",
      "text-sm text-gray-600 dark:text-gray-400",
      "overflow-hidden text-ellipsis whitespace-nowrap",
    ],
    
    /** Column resizer handle */
    resizer: [
      "absolute top-0 h-full w-4 cursor-col-resize select-none touch-none opacity-0",
      "group-hover:opacity-100",
      "hover:bg-blue-500/20 active:bg-blue-500/40",
      "[&.ltr]:right-0 [&.rtl]:left-0",
      "after:absolute after:right-0 after:top-0 after:h-full after:w-px after:bg-gray-300",
    ],
    
    empty: "text-center py-8",
    sortButton: "ms-2 inline-flex items-center gap-1",
    searchContainer: "mb-4",
    searchInput: "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
    headerGroup: "px-4 py-2 border-b bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200",
    resizerIndicator: [
      "fixed top-0 w-0.5 h-full bg-blue-500 z-50",
      "transition-transform",
      "[&.ltr]:translate-x-0 [&.rtl]:-translate-x-full",
    ],
  },
  variants: {
    variant: {
      modern: {
        wrapper: "rounded-lg border border-gray-500/20",
        headerCell: "first:rounded-tl-lg last:rounded-tr-lg",
      },
      minimal: {
        wrapper: "rounded-lg",
        headerCell: "first:rounded-tl-lg last:rounded-tr-lg",
      },
      classic: {
        wrapper: "border border-dashed border-gray-500/20",
      },
    },
  },
  defaultVariants: {
    variant: "modern",
  },
}) 