"use client";

import TableGrid from "@/components/ui/table-grid";
import dummyData from "@/data/dummy.json";
import type { Column } from "@/components/ui/table-grid";
import { useTableGrid } from "@/hooks/use-table-grid";
import { useDebouncedSearch } from "@/hooks/use-debounced-search";
import { useState } from "react";
import { Input } from "../ui/input";

interface DataItem extends Record<string, unknown> {
  id: number;
  name: string;
  age: number;
  email: string;
}

const columns: Column<DataItem>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    sortable: true,
  },
  {
    id: "age",
    header: "Age",
    accessorKey: "age",
    sortable: true,
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
    sortable: true,
  },
];

const FuzzySearchFilter = () => {
  const [isSearching, setIsSearching] = useState(false);

  // Initialize fuzzy search
  const { query, results, handleSearch } = useDebouncedSearch<DataItem>(
    dummyData,
    {
      keys: ["name", "email"],
      threshold: 0.3,
    },
    300
  );

  // Initialize table grid without additional filtering
  const { handleSort, sortColumn, sortDirection } = useTableGrid<DataItem>({
    data: results, // Use fuzzy search results directly
    columns,
    initialState: {
      sortColumn: "name",
      sortDirection: "asc",
    },
  });

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-xl font-semibold">Fuzzy Search with Debouncing</h2>
        <div className="relative">
          <Input
            type="text"
            value={query}
            onChange={(e) => {
              setIsSearching(true);
              handleSearch(e.target.value);
            }}
            placeholder="Search by name or email..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isSearching && query && (
            <div className="absolute right-3 top-2.5 text-sm text-gray-500">
              {results.length} results
            </div>
          )}
        </div>
      </div>

      <TableGrid<DataItem>
        columns={columns}
        data={results} // Use results directly instead of filteredData
        gridTemplateColumns="1fr 1fr 1fr"
        maxHeight="600px"
        variant="modern"
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />
    </div>
  );
};

export default FuzzySearchFilter;
