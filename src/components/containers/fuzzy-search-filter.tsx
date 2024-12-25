"use client";

import TableGrid from "@/components/ui/table-grid/table-grid";
import dummyData from "@/data/dummy.json";
import type { Column } from "@/components/ui/table-grid/table-grid";
import { useTableGrid } from "@/hooks/use-table-grid";

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
  const {
    filteredData,
    handleSort,
    sortColumn,
    sortDirection,
    setFilterValue,
    filterValue,
  } = useTableGrid<DataItem>({
    data: dummyData,
    columns,
    initialState: {
      sortColumn: "name",
      sortDirection: "asc",
    },
    enableFuzzySearch: true,
    fuzzySearchKeys: ["name", "age"],
    debounceMs: 500,
  });

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-xl font-semibold">Fuzzy Search with Debouncing</h2>
      </div>

      <TableGrid<DataItem>
        columns={columns}
        data={filteredData}
        gridTemplateColumns="1fr 1fr 1fr"
        maxHeight="600px"
        variant="modern"
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        enableFuzzySearch={true}
        filterValue={filterValue}
        onFilterChange={setFilterValue}
      />
    </div>
  );
};

export default FuzzySearchFilter;
