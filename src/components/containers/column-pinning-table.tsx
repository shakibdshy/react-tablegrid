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
  department: string;
  role: string;
  salary: number;
  status: string;
  location: string;
  joinDate: string;
  phone: string;
}

const columns: Column<DataItem>[] = [
  {
    id: "id",
    header: "ID",
    accessorKey: "id",
    sortable: true,
    pinned: "left",
  },
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
    sortable: true,
  },
  {
    id: "department",
    header: "Department",
    accessorKey: "department",
    sortable: true,
  },
  {
    id: "role",
    header: "Role",
    accessorKey: "role",
    sortable: true,
  },
  {
    id: "salary",
    header: "Salary",
    accessorKey: "salary",
    sortable: true,
    cell: ({ value }) => `$${(value as number).toLocaleString()}`,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    sortable: true,
  },
  {
    id: "location",
    header: "Location",
    accessorKey: "location",
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
  {
    id: "phone",
    header: "Phone",
    accessorKey: "phone",
    sortable: true,
  },
  {
    id: "joinDate",
    header: "Join Date",
    accessorKey: "joinDate",
    sortable: true,
  },
];

const ColumnPinningTable = () => {
  const { filteredData, handleSort, sortColumn, sortDirection } =
    useTableGrid<DataItem>({
      data: dummyData,
      columns,
      initialState: {
        sortColumn: "name",
        sortDirection: "asc",
      },
    });

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-2xl font-bold">Column Pinning</h2>
      </div>
      <TableGrid<DataItem>
        columns={columns}
        data={filteredData}
        gridTemplateColumns="1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr"
        maxHeight="400px"
        variant="classic"
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />
    </div>
  );
};

export default ColumnPinningTable;
