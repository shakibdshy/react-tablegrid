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

const FuzzySearchFilter = () => {
  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-xl font-semibold">Fuzzy Search with Debouncing</h2>
      </div>

      <TableContainer
        columns={columns}
        data={dummyData}
        maxHeight="600px"
        variant="modern"
        enableFuzzySearch={true}
        fuzzySearchKeys={["name", "age"]}
        onStateChange={(state) => {
          console.log("Table state changed:", state);
        }}
      />
    </div>
  );
};

export default FuzzySearchFilter;
