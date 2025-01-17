"use client";
import TableGrid from "@/components/ui/table-grid/table-grid";
import dummyData from "@/data/dummy.json";
import type { Column } from "@/components/ui/table-grid/table-grid";
import { useTableGrid } from "@/hooks/use-table-grid";
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

const BasicSearch = () => {
  const {
    filteredData,
    handleSort,
    sortColumn,
    sortDirection,
    setFilterValue,
  } = useTableGrid<DataItem>({
    data: dummyData,
    columns,
    initialState: {
      sortColumn: "name",
      sortDirection: "asc",
    },
    onStateChange: (state) => {
      console.log("Table state changed:", state);
    },
  });

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        <h2 className="text-xl font-semibold">Basic Search</h2>
        <Input
          type="text"
          onChange={(e) => setFilterValue(e.target.value)}
          placeholder="Search..."
          className="mb-4 px-3 py-2 border rounded"
        />
      </div>

      <TableGrid<DataItem>
        columns={columns}
        data={filteredData}
        gridTemplateColumns="1fr 1fr 1fr"
        maxHeight="400px"
        variant="classic"
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />
    </div>
  );
};

export default BasicSearch;
