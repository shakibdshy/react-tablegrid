import { tv } from "tailwind-variants"

export const tableStyles = tv({
  slots: {
    wrapper: "w-full relative overflow-hidden",
    scrollContainer: [
      "w-full overflow-auto",
      "scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100",
      "dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800",
      "hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500",
    ],
    table: "w-full min-w-max",
    header: "bg-gray-100 dark:bg-gray-700 sticky top-0 z-20 rounded-t-lg",
    headerRow: "grid items-center border-b border-dashed border-gray-500/20",
    headerCell: "px-3 py-3 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-100",
    body: "divide-y divide-dashed divide-gray-500/20",
    row: "grid items-center hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors",
    cell: "px-3 py-4 text-sm text-gray-600 dark:text-gray-400",
    empty: "text-center py-8",
    sortButton: "ms-2 inline-flex items-center gap-1",
    searchContainer: "mb-4",
    searchInput: "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
    headerGroup: "px-4 py-2 border-b bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200",
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