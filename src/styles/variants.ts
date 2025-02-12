import { TableVariant } from "@/types/table.types"

export interface TableVariantStyles {
  wrapper: string
  TableColumn: string
}

export const tableVariants: Record<TableVariant, TableVariantStyles> = {
  modern: {
    wrapper: "rounded-lg border border-gray-500/20",
    TableColumn: "first:rounded-tl-lg last:rounded-tr-lg",
  },
  minimal: {
    wrapper: "rounded-lg",
    TableColumn: "first:rounded-tl-lg last:rounded-tr-lg",
  },
  classic: {
    wrapper: "border border-dashed border-gray-500/20",
    TableColumn: "",
  },
}

export const defaultVariant: TableVariant = "modern" 