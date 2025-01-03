"use client";
import { useMemo } from "react";
import TableGrid from "@/components/ui/table-grid/table-grid";
import dummyData from "@/data/dummy.json";
import { useTableGrid } from "@/hooks/use-table-grid";
import { createColumnHelper } from "@/components/ui/table-grid/column-helper";
import { useDirection } from "@/hooks/use-direction";

interface DataItem {
  id: number;
  name: string;
  age: number;
  email: string;
  department: string;
  role: string;
  salary: number;
}

const columnHelper = createColumnHelper<DataItem>();

const ColumnResizingTable = () => {
  const { direction } = useDirection();
  
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        sortable: true,
      }),
      columnHelper.accessor("name", {
        header: "Name",
        sortable: true,
      }),
      columnHelper.accessor("email", {
        header: "Email",
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
      }),
    ],
    []
  );

  const {
    filteredData,
    handleSort,
    sortColumn,
    sortDirection,
    columnSizing,
    handleColumnResize,
    columnResizeInfo,
  } = useTableGrid<DataItem>({
    data: dummyData,
    columns,
    columnResizeMode: 'onChange',
    initialState: {
      sortColumn: "name",
      sortDirection: "asc",
    },
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Column Resizing Table</h2>
      </div>
      <TableGrid<DataItem>
        columns={columns}
        data={filteredData}
        gridTemplateColumns="1fr 1fr 1fr 1fr 1fr 1fr"
        maxHeight="400px"
        variant="classic"
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        columnResizeMode="onChange"
        columnResizeDirection={direction as 'ltr' | 'rtl'}
        onColumnSizingChange={(columnSizing) => {
          if (columnSizing.columnSizes) {
            Object.entries(columnSizing.columnSizes).forEach(([columnId, width]) => {
              handleColumnResize(columnId, width);
            });
          }
        }}
        columnSizing={columnSizing}
        columnResizeInfo={columnResizeInfo}
      />
    </div>
  );
};

export default ColumnResizingTable;
