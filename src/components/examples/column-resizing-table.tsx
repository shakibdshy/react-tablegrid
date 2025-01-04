"use client";
import { TableContainer } from "@/components/containers/table-container/table-container";
import dummyData from "@/data/dummy.json";
import { createColumnHelper } from "@/utils/column-helper";
import type { Column } from "@/types/column.types";

interface DataItem extends Record<string, unknown> {
  id: number;
  name: string;
  age: number;
  email: string;
  department: string;
  role: string;
  salary: number;
}

const columnHelper = createColumnHelper<DataItem>();

const columns: Column<DataItem>[] = [
  columnHelper.accessor("id", {
    header: "ID",
    sortable: true,
    width: "80px",
  }),
  columnHelper.accessor("name", {
    header: "Name",
    sortable: true,
    width: "200px",
  }),
  columnHelper.accessor("email", {
    header: "Email",
    sortable: true,
    width: "250px",
  }),
  columnHelper.accessor("department", {
    header: "Department",
    sortable: true,
    width: "150px",
  }),
  columnHelper.accessor("role", {
    header: "Role",
    sortable: true,
    width: "150px",
  }),
  columnHelper.accessor("salary", {
    header: "Salary",
    sortable: true,
    width: "120px",
    cell: ({ value }) => `$${(value as number).toLocaleString()}`,
  }),
];

const ColumnResizingTable = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Column Resizing Table</h2>
      </div>
      <TableContainer
        columns={columns}
        data={dummyData}
        maxHeight="400px"
        variant="classic"
        columnResizeMode="onChange"
        onStateChange={(state) => {
          console.log("Table state changed:", state);
        }}
      />
    </div>
  );
};

export default ColumnResizingTable;
