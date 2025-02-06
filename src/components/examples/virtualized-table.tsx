"use client";
import { useState } from "react";
import dummyData from "@/data/dummy.json";
import {
  createColumnHelper,
  TableGrid,
  Column,
} from "@shakibdshy/react-tablegrid";

type DataItem = {
  id: number;
  name: string;
  age: number;
  email: string;
  department: string;
  role: string;
  salary: number;
  status: string;
};

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

const generateMoreData = () => {
  const moreData = [];
  const baseData = dummyData.slice(0, 10);

  for (let i = 0; i < 100; i++) {
    moreData.push(
      ...baseData.map((item) => ({
        ...item,
        id: i * baseData.length + (item.id as number),
        salary: Math.floor(Math.random() * 100000) + 50000,
        status: Math.random() > 0.5 ? "Active" : "Inactive",
      }))
    );
  }
  return moreData;
};

const VirtualizedTable = () => {
  const [virtualData] = useState(() => generateMoreData());

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-2xl font-bold">Virtualized Table</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Displaying {virtualData.length.toLocaleString()} rows with
          virtualization
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <TableGrid
          columns={columns}
          data={virtualData}
          variant="modern"
          virtualization={{
            enabled: true,
            rowHeight: 52,
            overscan: 5,
            scrollingDelay: 500,
          }}
          maxHeight="100%"
          styleConfig={{
            header: {
              className:
                "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200",
            },
            row: {
              className:
                "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
            },
            cell: {
              className: "px-4 py-3 text-sm text-gray-600 dark:text-gray-300",
            },
          }}
          onStateChange={(state) => {
            console.log("Table state changed:", state);
          }}
        />
      </div>
    </div>
  );
};

export default VirtualizedTable;
