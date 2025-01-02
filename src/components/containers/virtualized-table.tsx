"use client"
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
}

const columnHelper = createColumnHelper<DataItem>();

const columns = [
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
  const { filteredData, handleSort, sortColumn, sortDirection } = useTableGrid<DataItem>({
    data: generateMoreData(), // Using expanded dataset
    columns,
    initialState: {
      sortColumn: "name",
      sortDirection: "asc",
    },
  });

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-2xl font-bold">Virtualized Table</h2>
        <p className="text-gray-600">
          Displaying {filteredData.length} rows with virtualization
        </p>
      </div>

      <TableGrid<DataItem>
        columns={columns}
        data={filteredData}
        gridTemplateColumns="repeat(5, 1fr)"
        maxHeight="600px"
        variant="modern"
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        events={{
          onSort: handleSort,
        }}
        virtualization={{
          enabled: true,
          rowHeight: 48,
          overscan: 5,
        }}
      />
    </div>
  );
};

export default VirtualizedTable; 