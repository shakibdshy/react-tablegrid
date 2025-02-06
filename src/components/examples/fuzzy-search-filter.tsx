"use client";
import dummyData from "@/data/dummy.json";
import {
  createColumnHelper,
  TableGrid,
  Column,
} from "@shakibdshy/react-tablegrid";
import { useCallback } from "react";
import type { TableState } from "@/types/table.types";

import { useDebouncedSearch } from "@/hooks/use-debounced-search";

type DataItem = {
  id: number;
  name: string;
  age: number;
  email: string;
};

const columnHelper = createColumnHelper<DataItem>();

const columns: Column<DataItem>[] = [
  columnHelper.accessor("name", {
    header: "Name",
    sortable: true,
  }),
  columnHelper.accessor("age", {
    header: "Age",
    sortable: true,
  }),
  columnHelper.accessor("email", {
    header: "Email",
    sortable: true,
  }),
];

const FuzzySearchFilter = () => {
  const { query, results, handleSearch } = useDebouncedSearch<DataItem>(
    dummyData,
    {
      keys: ["name", "age"],
      threshold: 0.3,
      distance: 100,
    }
  );

  // Handle state changes
  const handleStateChange = useCallback(
    (state: TableState<DataItem>) => {
      console.log("Table state changed:", state);
      handleSearch(state.filterValue || "");
    },
    [handleSearch]
  );

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-xl font-semibold">Fuzzy Search with Debouncing</h2>
        <p className="text-sm text-gray-600">
          Try searching for partial names or approximate matches
        </p>
      </div>

      <TableGrid
        columns={columns}
        data={results}
        maxHeight="600px"
        variant="modern"
        enableFiltering={true}
        filterValue={query}
        onStateChange={handleStateChange}
      />
    </div>
  );
};

export default FuzzySearchFilter;
