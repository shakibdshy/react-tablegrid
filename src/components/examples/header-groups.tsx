"use client";
import dummyData from "@/data/dummy.json";
// import {
//   createColumnHelper,
//   TableGrid,
//   Column,
// } from "@shakibdshy/react-tablegrid";
import { TableContainer as TableGrid } from "@/components/containers/table-container/table-container";
import { createColumnHelper } from "@/utils/column-helper";
import type { Column } from "@/types/column.types";

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
    group: "Personal Information",
  }),
  columnHelper.accessor("age", {
    header: "Age",
    sortable: true,
    group: "Personal Information",
  }),
  columnHelper.accessor("email", {
    header: "Email",
    sortable: true,
    group: "Contact Information",
  }),
];

const HeaderGroupsTable = () => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Header Groups</h2>
      </div>

      <TableGrid
        columns={columns}
        data={dummyData}
        maxHeight="800px"
        variant="classic"
        headerGroups={true}
        onStateChange={(state) => {
          console.log("Table state changed:", state);
        }}
      />
    </div>
  );
};

export default HeaderGroupsTable;
