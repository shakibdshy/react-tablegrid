"use client"
import TableGrid from "@/components/ui/table-grid";
import dummyData from "@/data/dummy.json";
import type { Column } from "@/components/ui/table-grid";
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

// Helper function to organize columns by groups
const getHeaderGroups = (columns: Column<DataItem>[]) => {
  const groups = columns.reduce((acc, column) => {
    const group = column.group || 'Ungrouped'
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(column)
    return acc
  }, {} as Record<string, Column<DataItem>[]>)

  return Object.entries(groups).map(([groupName, groupColumns]) => ({
    id: groupName,
    name: groupName,
    columns: groupColumns,
  }))
}

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

  const headerGroups = getHeaderGroups(columns);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Header Groups</h2>
      </div>
      
      <TableGrid<DataItem>
        columns={columns}
        data={filteredData}
        headerGroups={headerGroups}
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
