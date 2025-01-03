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

const ColumnVisibilityTable = () => {
  const {
    filteredData,
    handleSort,
    sortColumn,
    sortDirection,
    visibleColumns,
    toggleColumnVisibility,
  } = useTableGrid<DataItem>({
    data: dummyData,
    columns,
    initialState: {
      sortColumn: "name",
      sortDirection: "asc",
      visibleColumns: columns.map(col => col.id),
    },
    onStateChange: (state) => {
      console.log("Table state changed:", state)
    },
  });

  const visibleColumnsConfig = columns.filter(col => 
    visibleColumns.includes(col.id)
  );

  return (
    <div className="p-4">   
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-2xl font-bold">Column Visibility</h2>
        
        <div className="flex gap-4 flex-wrap">
          {columns.map(column => (
            <label
              key={column.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={visibleColumns.includes(column.id)}
                onChange={() => toggleColumnVisibility(column.id)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span>
                {typeof column.header === 'function' ? column.header() : column.header}
              </span>
            </label>
          ))}
        </div>
      </div>

      <TableGrid<DataItem>
        columns={visibleColumnsConfig}
        data={filteredData}
        gridTemplateColumns={`repeat(${visibleColumnsConfig.length}, 1fr)`}
        maxHeight="400px"
        variant="classic"
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />
    </div>
  );
};

export default ColumnVisibilityTable;
