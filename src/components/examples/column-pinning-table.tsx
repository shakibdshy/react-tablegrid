"use client";
import TableGrid from "@/components/ui/table-grid/table-grid";
import dummyData from "@/data/dummy.json";
import { useTableGrid } from "@/hooks/use-table-grid";
import { createColumnHelper } from "@/components/ui/table-grid/column-helper";

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

const columns = [
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
  columnHelper.accessor("joinDate", {
    header: "Join Date",
    sortable: true,
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    sortable: true,
  }),
];

const ColumnPinningTable = () => {
  const { filteredData, handleSort, sortColumn, sortDirection } =
    useTableGrid<DataItem>({
      data: dummyData,
      columns,
      initialState: {
        sortColumn: "name",
        sortDirection: "asc",
      },
    });

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-2xl font-bold">Column Pinning</h2>
      </div>
      <TableGrid<DataItem>
        columns={columns}
        data={filteredData}
        gridTemplateColumns="1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr"
        maxHeight="400px"
        variant="classic"
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />
    </div>
  );
};

export default ColumnPinningTable;
