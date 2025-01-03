import { createContext, useContext } from "react";
import type { TableContextValue } from "@/types/table.types";

const TableContext = createContext<
  TableContextValue<Record<string, unknown>> | undefined
>(undefined);

export function useTable<T extends Record<string, unknown>>() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("useTable must be used within a TableProvider");
  }
  return context as TableContextValue<T>;
}

export const TableProvider = TableContext.Provider;
