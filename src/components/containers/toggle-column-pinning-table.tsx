"use client"
import TableGrid from "@/components/ui/table-grid/table-grid";
import dummyData from "@/data/dummy.json";
import type { Column } from "@/components/ui/table-grid/table-grid";
import { useTableGrid } from "@/hooks/use-table-grid";
import { PiPushPinSimpleFill } from "react-icons/pi";
import { useMemo } from "react";

interface DataItem extends Record<string, unknown> {
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

const columns: Column<DataItem>[] = [
  { 
    id: "id", 
    header: "ID", 
    accessorKey: "id",
    sortable: true,
    width: "80px"
  },
  { 
    id: "name", 
    header: "Name", 
    accessorKey: "name",
    sortable: true,
  },
  { 
    id: "department", 
    header: "Department", 
    accessorKey: "department",
    sortable: true 
  },
  { 
    id: "role", 
    header: "Role", 
    accessorKey: "role",
    sortable: true 
  },
  { 
    id: "salary", 
    header: "Salary", 
    accessorKey: "salary",
    sortable: true,
    cell: ({ value }) => `$${(value as number).toLocaleString()}`
  },
  { 
    id: "status", 
    header: "Status", 
    accessorKey: "status",
    sortable: true 
  },
  { 
    id: "location", 
    header: "Location", 
    accessorKey: "location",
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
    sortable: true,
  },
  { 
    id: "phone", 
    header: "Phone", 
    accessorKey: "phone",
    sortable: true,
  },
  { 
    id: "joinDate", 
    header: "Join Date", 
    accessorKey: "joinDate",
    sortable: true 
  },
];

const ToggleColumnPinningTable = () => {
  const {
    filteredData,
    handleSort,
    sortColumn,
    sortDirection,
    pinnedColumns,
    toggleColumnPin,
  } = useTableGrid<DataItem>({
    data: dummyData,
    columns,
    initialState: {
      sortColumn: "name",
      sortDirection: "asc",
      pinnedColumns: {
        left: ["id"],
        right: ["phone"]
      },
    },
  });

  const syncedColumns = useMemo(() => 
    columns.map(column => ({
      ...column,
      pinned: pinnedColumns.left.includes(column.id) 
        ? 'left' as const
        : pinnedColumns.right.includes(column.id)
          ? 'right' as const
          : false as const
    })), [columns, pinnedColumns]
  );

  const renderPinningControls = (columnId: string) => {
    const isPinnedLeft = pinnedColumns.left.includes(columnId);
    const isPinnedRight = pinnedColumns.right.includes(columnId);

    return (
      <div className="flex gap-2">
        <button
          className={`flex items-center gap-2 ${isPinnedLeft ? "text-blue-500" : ""}`}
          onClick={() => toggleColumnPin(columnId, isPinnedLeft ? false : 'left')}
          disabled={isPinnedRight}
        >
          <PiPushPinSimpleFill className={isPinnedLeft ? "rotate-45" : ""} />
          <span className="ml-2">Pin Left</span>
        </button>
        <button
          className={`flex items-center gap-2 ${isPinnedRight ? "text-blue-500" : ""}`}
          onClick={() => toggleColumnPin(columnId, isPinnedRight ? false : 'right')}
          disabled={isPinnedLeft}
        >
          <PiPushPinSimpleFill className={isPinnedRight ? "rotate-45" : ""} />
          <span className="ml-2">Pin Right</span>
        </button>
      </div>
    );
  };

  return (
    <div className="p-4">  
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-2xl font-bold">Column Pinning</h2>
        <div className="flex flex-wrap gap-4">
          {columns.map((column) => (
            <div key={column.id} className="flex items-center gap-2">
              <span>{column.header as string}:</span>
              {renderPinningControls(column.id as string)}
            </div>
          ))}
        </div>
      </div>
      <TableGrid<DataItem>
        columns={syncedColumns}
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

export default ToggleColumnPinningTable;
