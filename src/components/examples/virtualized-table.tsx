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
  department: string;
  role: string;
  salary: number;
  status: string;
}

const columnHelper = createColumnHelper<DataItem>();

const columns: Column<DataItem>[] = [
  columnHelper.accessor("id", {
    header: "ID",
    sortable: true,
  }),
  columnHelper.accessor("name", {
    header: "Name",
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
  columnHelper.accessor("salary", {
    header: "Salary",
    sortable: true,
    cell: ({ value }) => `$${(value as number).toLocaleString()}`,
  }),
];

// Generate more data for better virtualization demo
const generateMoreData = () => {
  const moreData = [];
  for (let i = 0; i < 10; i++) {
    moreData.push(
      ...dummyData.map((item, index) => ({
        ...item,
        id: item.id + index * dummyData.length + i * dummyData.length * 10,
      }))
    );
  }
  return moreData;
};

const VirtualizedTable = () => {
  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-2xl font-bold">Virtualized Table</h2>
        <p className="text-gray-600">
          Displaying {generateMoreData().length} rows with virtualization
        </p>
      </div>

      <TableContainer
        columns={columns}
        data={generateMoreData()}
        maxHeight="600px"
        variant="modern"
        virtualization={{
          enabled: true,
          rowHeight: 48,
          overscan: 5,
        }}
        onStateChange={(state) => {
          console.log("Table state changed:", state);
        }}
      />
    </div>
  );
};

export default VirtualizedTable; 