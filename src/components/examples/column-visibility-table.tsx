"use client"
import { useState } from "react";
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
    width: "380px",
  }),
  columnHelper.accessor("age", {
    header: "Age",
    sortable: true,
    width: "200px",
  }),
  columnHelper.accessor("email", {
    header: "Email",
    sortable: true,
    width: "220px",
  }),
  columnHelper.accessor("department", {
    header: "Department",
    sortable: true,
    width: "250px",
  }),
  columnHelper.accessor("role", {
    header: "Role",
    sortable: true,
    width: "250px",
  }),
  columnHelper.accessor("salary", {
    header: "Salary",
    sortable: true,
    width: "250px",
    cell: ({ value }) => `$${(value as number).toLocaleString()}`,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    sortable: true,
    width: "250px",
    cell: ({ value }) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          String(value) === "Active"
            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
            : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
        }`}
      >
        {String(value)}
      </span>
    ),
  }),
  columnHelper.accessor("location", {
    header: "Location",
    sortable: true,
    width: "250px",
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    sortable: true,
    width: "250px",
  }),
  columnHelper.accessor("joinDate", {
    header: "Join Date",
    sortable: true,
    width: "250px",
    cell: ({ value }) => new Date(value as string).toLocaleDateString(),
  }),
];

const ColumnVisibilityTable = () => {
  const [tableState, setTableState] = useState<TableState<DataItem>>({
    data: dummyData,
    pinnedColumns: { left: [], right: [] },
    columnSizing: {
      columnSizes: columns.reduce((acc, column) => {
        if (column.width) {
          const width = parseInt(column.width.toString().replace('px', ''), 10);
          if (!isNaN(width)) {
            acc[String(column.id)] = width;
          }
        }
        return acc;
      }, {} as Record<string, number>),
    },
    visibleColumns: columns.map(col => col.accessorKey),
    sortColumn: "" as keyof DataItem,
    sortDirection: "asc",
    filterValue: "",
    columnResizeMode: "onChange",
  });

  const toggleColumnVisibility = (columnId: keyof DataItem) => {
    setTableState(prevState => ({
      ...prevState,
      visibleColumns: prevState.visibleColumns.includes(columnId)
        ? prevState.visibleColumns.filter(id => id !== columnId)
        : [...prevState.visibleColumns, columnId]
    }));
  };

  const toggleAllColumns = () => {
    setTableState(prevState => ({
      ...prevState,
      visibleColumns: prevState.visibleColumns.length === columns.length
        ? []
        : columns.map(col => col.accessorKey)
    }));
  };

  return (
    <div className="p-4">   
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Column Visibility</h2>
          <button
            onClick={toggleAllColumns}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {tableState.visibleColumns.length === columns.length ? "Hide All" : "Show All"}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {columns.map((column) => (
            <div key={String(column.id)} className="flex items-center">
              <button
                onClick={() => toggleColumnVisibility(column.accessorKey)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  tableState.visibleColumns.includes(column.accessorKey)
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate">{String(column.header)}</span>
                  {tableState.visibleColumns.includes(column.accessorKey) ? (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <TableContainer
          columns={columns.filter(col => tableState.visibleColumns.includes(col.accessorKey))}
          data={dummyData}
          maxHeight="600px"
          variant="modern"
          styleConfig={{
            header: {
              className: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200",
            },
            row: {
              className: "hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
            },
            cell: {
              className: "px-4 py-3 text-sm text-gray-600 dark:text-gray-300",
            },
          }}
          onStateChange={(state) => {
            setTableState(prevState => ({
              ...prevState,
              ...state,
              visibleColumns: prevState.visibleColumns
            }));
          }}
        />
      </div>
    </div>
  );
};

export default ColumnVisibilityTable;
