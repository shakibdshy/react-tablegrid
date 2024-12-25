"use client"
import TableGrid from "@/components/ui/table-grid/table-grid";
import dummyData from "@/data/dummy.json";
import type { Column } from "@/components/ui/table-grid/table-grid";
import { useTableGrid } from "@/hooks/use-table-grid";

interface DataItem extends Record<string, unknown> {
  id: number;
  name: string;
  age: number;
  email: string;
}

const columns: Column<DataItem>[] = [
  { 
    id: "name", 
    header: "Name",
    accessorKey: "name",
    sortable: true,
    group: "Personal Information",
    width: "200px"
  },
  { 
    id: "age", 
    header: "Age",
    accessorKey: "age",
    sortable: true,
    group: "Personal Information",
    width: "100px"
  },
  { 
    id: "email", 
    header: "Email",
    accessorKey: "email",
    sortable: true,
    group: "Contact Information",
    width: "250px"
  },
];

const HeaderGroupsTable = () => {
  const {
    filteredData,
    handleSort,
    sortColumn,
    sortDirection,
  } = useTableGrid<DataItem>({
    data: dummyData,
    columns,
    initialState: {
      sortColumn: "name",
      sortDirection: "asc",
    },
    onStateChange: (state) => {
      console.log("Table state changed:", state)
    },
  });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Header Groups</h2>
      </div>
      
      <TableGrid<DataItem>
        columns={columns}
        data={filteredData}
        gridTemplateColumns="1fr 1fr 1fr"
        maxHeight="800px"
        variant="classic"
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />
    </div>
  );
};

export default HeaderGroupsTable;
