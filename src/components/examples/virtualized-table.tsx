"use client";
import { useState, useRef } from "react";
import dummyData from "@/data/dummy.json";
import { createColumnHelper } from "@/utils/column-helper";
import { Column } from "@/types/column.types";
import { TableContainer } from "../containers/table-container/table-container";
// import {
//   createColumnHelper,
//   TableGrid,
//   Column,
// } from "@shakibdshy/react-tablegrid";

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
  const tableRef = useRef<{ scrollTo: (index: number) => void }>(null);

  const handleScrollToMiddle = () => {
    const middleIndex = Math.floor(virtualData.length / 2);
    tableRef.current?.scrollTo(middleIndex);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Virtualized Table</h2>
          <button
            onClick={handleScrollToMiddle}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Scroll to Middle
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Displaying {virtualData.length.toLocaleString()} rows with virtualization
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <TableContainer
          ref={tableRef}
          columns={columns}
          data={virtualData}
          enableFiltering
          virtualization={{
            enabled: true,
            rowHeight: 60,
            overscan: 5,
            scrollingDelay: 150,
            onEndReached: () => {
              console.log("onEndReached");
            },
          }}
          maxHeight="600px"
        />
      </div>
    </div>
  );
};

export default VirtualizedTable;
