"use client";
import { useState, useCallback, useMemo } from "react";
import { TableContainer } from "@/components/containers/table-container/table-container";
import dummyData from "@/data/dummy.json";
import { createColumnHelper } from "@/utils/column-helper";
import type { Column } from "@/types/column.types";
import type { TableState } from "@/types/table.types";

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

const columnHelper = createColumnHelper<DataItem>();

const columns: Column<DataItem>[] = [
  columnHelper.accessor("id", {
    header: "ID",
    sortable: true,
    width: "80px",
  }),
  columnHelper.accessor("name", {
    header: "Name",
    sortable: true,
    width: "350px",
  }),
  columnHelper.accessor("department", {
    header: "Department",
    sortable: true,
    width: "350px",
  }),
  columnHelper.accessor("role", {
    header: "Role",
    sortable: true,
    width: "350px",
  }),
  columnHelper.accessor("salary", {
    header: "Salary",
    sortable: true,
    width: "320px",
    cell: ({ value }) => `$${(value as number).toLocaleString()}`,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    sortable: true,
    width: "320px",
  }),
  columnHelper.accessor("location", {
    header: "Location",
    sortable: true,
    width: "350px",
  }),
  columnHelper.accessor("age", {
    header: "Age",
    sortable: true,
    width: "380px",
  }),
  columnHelper.accessor("email", {
    header: "Email",
    sortable: true,
    width: "380px",
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    sortable: true,
    width: "380px",
  }),
  columnHelper.accessor("joinDate", {
    header: "Join Date",
    sortable: true,
    width: "580px",
  }),
];

const initialColumnSizing = {
  columnSizes: columns.reduce((acc, column) => {
    if (column.width) {
      const width = parseInt(column.width.toString().replace("px", ""), 10);
      if (!isNaN(width)) {
        acc[String(column.id)] = width;
      }
    }
    return acc;
  }, {} as Record<string, number>),
};

function shallowEqual<T extends Record<string, unknown>>(
  obj1: T,
  obj2: T
): boolean {
  if (obj1 === obj2) return true;
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) return false;
  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
}

const ToggleColumnPinningTable = () => {
  const [tableState, setTableState] = useState<TableState<DataItem>>({
    data: dummyData,
    pinnedColumns: { left: [], right: [] },
    columnSizing: initialColumnSizing,
    visibleColumns: columns.map((col) => col.accessorKey),
    sortColumn: "" as keyof DataItem,
    sortDirection: "asc",
    filterValue: "",
    columnResizeMode: "onChange",
  });

  // Memoize the onStateChange callback with a shallow equality check to avoid infinite updates
  const handleTableStateChange = useCallback((state: TableState<DataItem>) => {
    setTableState((prevState) => {
      const merged = {
        ...prevState,
        ...state,
        pinnedColumns: prevState.pinnedColumns,
      };
      if (shallowEqual(prevState, merged)) return prevState;
      return merged;
    });
  }, []);

  const computedColumns = useMemo<Column<DataItem>[]>(() => {
    return columns.map((column) => {
      const newColumn: Column<DataItem> = {
        ...column,
        pinned: tableState.pinnedColumns.left.includes(column.accessorKey)
          ? "left"
          : tableState.pinnedColumns.right.includes(column.accessorKey)
          ? "right"
          : undefined,
      };
      return newColumn;
    });
  }, [tableState.pinnedColumns]);

  const handleColumnPin = (
    columnId: keyof DataItem,
    position: "left" | "right" | false
  ) => {
    setTableState((prevState) => {
      const newLeft = prevState.pinnedColumns.left.filter(
        (id) => id !== columnId
      );
      const newRight = prevState.pinnedColumns.right.filter(
        (id) => id !== columnId
      );

      if (position === "left") {
        newLeft.push(columnId);
      } else if (position === "right") {
        newRight.push(columnId);
      }

      return {
        ...prevState,
        pinnedColumns: {
          left: newLeft,
          right: newRight,
        },
      };
    });
  };

  return (
    <div className="p-4">
      <div className="flex flex-col gap-4 mb-4">
        <h2 className="text-2xl font-bold">Toggle Column Pinning</h2>
        <div className="flex flex-wrap gap-4">
          {columns.map((column) => (
            <div
              key={String(column.id)}
              className="flex items-center gap-2 p-2 border rounded"
            >
              <span>{String(column.header)}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleColumnPin(column.accessorKey, "left")}
                  className={`px-2 py-1 text-sm rounded ${
                    tableState.pinnedColumns.left.includes(column.accessorKey)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  Pin Left
                </button>
                <button
                  onClick={() => handleColumnPin(column.accessorKey, "right")}
                  className={`px-2 py-1 text-sm rounded ${
                    tableState.pinnedColumns.right.includes(column.accessorKey)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  Pin Right
                </button>
                {(tableState.pinnedColumns.left.includes(column.accessorKey) ||
                  tableState.pinnedColumns.right.includes(
                    column.accessorKey
                  )) && (
                  <button
                    onClick={() => handleColumnPin(column.accessorKey, false)}
                    className="px-2 py-1 text-sm bg-red-200 rounded hover:bg-red-300"
                  >
                    Unpin
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <TableContainer
          key={`${tableState.pinnedColumns.left.join(
            "_"
          )}_${tableState.pinnedColumns.right.join("_")}`}
          columns={computedColumns}
          data={dummyData}
          maxHeight="600px"
          variant="classic"
          onStateChange={handleTableStateChange}
        />
      </div>
    </div>
  );
};

export default ToggleColumnPinningTable;
