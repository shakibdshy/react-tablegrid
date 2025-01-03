"use client"
import dummyData from "@/data/dummy.json";
import { TableGrid, useTableGrid, Column } from "@shakibdshy/react-tablegrid";

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
    sortable: true 
  },
  { 
    id: "age", 
    header: "Age", 
    accessorKey: "age",
    sortable: true 
  },
  { 
    id: "email", 
    header: "Email", 
    accessorKey: "email",
    sortable: true 
  },
];

const BasicTable = () => {
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
      <TableGrid<DataItem>
        columns={columns}
        data={filteredData}
        gridTemplateColumns="1fr 1fr 1fr"
        maxHeight="400px"
        variant="classic"
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />
    </div>
  );
};

export default BasicTable;
