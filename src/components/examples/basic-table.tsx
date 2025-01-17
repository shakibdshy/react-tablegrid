"use client"
import { TableContainer } from "@/components/containers/table-container/table-container";
import dummyData from "@/data/dummy.json";
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
    sortable: false,
  }),
  columnHelper.accessor("age", {
    header: "Age",
    sortable: false,
  }),
  columnHelper.accessor("email", {
    header: "Email",
    sortable: false,
  }),
];

const BasicTable = () => {
  return (
    <div className="p-4">      
      <TableContainer
        columns={columns}
        data={dummyData}
        maxHeight="400px"
        variant="modern"
        // enableFiltering={true}
        // enableFuzzySearch={true}
        onStateChange={(state) => {
          console.log("Table state changed:", state);
        }}
      />
    </div>
  );
};

export default BasicTable;
