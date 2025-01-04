"use client"
import { TableContainer } from "@/components/containers/table-container/table-container";
import dummyData from "@/data/dummy.json";
import { createColumnHelper } from "@/utils/column-helper";
import type { Column } from "@/types/column.types";

interface DataItem extends Record<string, unknown> {
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
    group: "Personal Information",
    width: "200px",
  }),
  columnHelper.accessor("age", {
    header: "Age",
    sortable: true,
    group: "Personal Information",
    width: "100px",
  }),
  columnHelper.accessor("email", {
    header: "Email",
    sortable: true,
    group: "Contact Information",
    width: "250px",
  }),
];

const HeaderGroupsTable = () => {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Header Groups</h2>
      </div>
      
      <TableContainer
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
