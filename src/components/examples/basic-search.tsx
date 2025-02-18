"use client";
import dummyData from "@/data/dummy.json";
// import {
//   createColumnHelper,
//   Column,
//   TableGrid,
// } from "@shakibdshy/react-tablegrid";
import { TableGrid } from "@/components/containers/table-grid/table-grid";
import { createColumnHelper } from "@/utils/column-helper";
import type { Column } from "@/types/column.types";

type DataItem = {
  id: number;
  name: string;
  age: number;
  email: string;
}


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

const BasicSearch = () => {
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        <h2 className="text-xl font-semibold">Basic Search</h2>
      </div>

      <TableGrid
        columns={columns}
        data={dummyData}
        maxHeight="400px"
        variant="classic"
        enableFiltering={true}
        onStateChange={(state) => {
          console.log("Table state changed:", state);
        }}
      />
    </div>
  );
};

export default BasicSearch;
