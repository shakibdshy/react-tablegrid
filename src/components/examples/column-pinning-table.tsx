"use client";
import dummyData from "@/data/dummy.json";
import { TableGrid } from "../containers/table-grid/table-grid";
import { createColumnHelper } from "@/utils/column-helper";
import { Column } from "@/types/column.types";
// import {
//   createColumnHelper,
//   TableGrid,
//   Column,
// } from "@shakibdshy/react-tablegrid";

interface DataItem {
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

const columnHelper = createColumnHelper<DataItem>();

const columns: Column<DataItem>[] = [
  columnHelper.accessor("id", {
    header: "ID",
    sortable: true,
    pinned: "left",
  }),
  columnHelper.accessor("name", {
    header: "Name",
    sortable: true,
  }),
  columnHelper.accessor("salary", {
    header: "Salary",
    sortable: true,
    cell: ({ value }) => `$${(value as number).toLocaleString()}`,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    sortable: true,
  }),
  columnHelper.accessor("location", {
    header: "Location",
    sortable: true,
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    sortable: true,
  }),
  columnHelper.accessor("email", {
    header: "Email",
    sortable: true,
  }),
  columnHelper.accessor("department", {
    header: "Department",
    sortable: true,
  }),
  columnHelper.accessor("role", {
    header: "Role",
    sortable: true,
  }),
  columnHelper.accessor("joinDate", {
    header: "Join Date",
    sortable: true,
    pinned: "right",
  }),
];

const ColumnPinningTable = () => {
  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-2xl font-bold">Column Pinning</h2>
      </div>
      <TableGrid
        columns={columns}
        data={dummyData}
        maxHeight="400px"
        onStateChange={(state) => {
          console.log("Table state changed:", state);
        }}
      />
    </div>
  );
};

export default ColumnPinningTable;
