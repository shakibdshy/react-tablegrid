"use client";

import React, { useState } from "react";
import { TableContainer } from "@/components/containers/table-container/table-container";
import nestedData from "@/data/nested-data.json";
import { ChevronRight, ChevronDown } from "lucide-react";
import { createColumnHelper } from "@/utils/column-helper";

interface NestedRowData extends Record<string, unknown> {
  id: string;
  name: string;
  amount: number;
  children?: NestedRowData[];
}

function transformData(): NestedRowData[] {
  return Object.values(nestedData.balanceSheet) as NestedRowData[];
}

export default function NestedTableExample() {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const allData: NestedRowData[] = transformData();

  const columnHelper = createColumnHelper<NestedRowData>();
  const columns = [
    columnHelper.accessor("id", {
      header: "Id",
      cell: ({ row }) => row.id,
    }),
    columnHelper.accessor("name", { header: "Name" }),
    columnHelper.accessor("amount", { header: "Amount" }),
  ];

  const renderRow = (
    row: NestedRowData,
    rowIndex: number,
    level: number = 0
  ): React.ReactNode => (
    <React.Fragment key={`${row.id}-${rowIndex}`}>
      <div className="flex items-center p-2">
        <div className="w-24 text-center">{row.id}</div>
        <div
          className="flex-1 flex items-center"
          style={{ paddingLeft: `${level * 20}px` }}
        >
          {row.children ? (
            <button
              onClick={() => toggleRow(row.id)}
              className="mr-2 focus:outline-none"
            >
              {expandedRows.includes(row.id) ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <span className="inline-block w-6 mr-2" />
          )}
          <span>{row.name}</span>
        </div>

        <div className="w-32 text-right">{row.amount}</div>
      </div>
      {row.children &&
        expandedRows.includes(row.id) &&
        row.children.map((child, index) => renderRow(child, index, level + 1))}
    </React.Fragment>
  );

  const CustomRowRenderer = (
    row: NestedRowData,
    rowIndex: number,
    _value: unknown
  ): React.ReactNode => {
    void _value;
    return <>{renderRow(row, rowIndex)}</>;
  };

  return (
    <div className="space-y-4">
      <TableContainer<NestedRowData>
        data={allData}
        columns={columns}
        maxHeight="800px"
        enableColumnResize={false}
        styleConfig={{
          row: {
            className: "",
          },
          cell: {
            className: "py-2 px-4",
          },
        }}
        customRender={{
          renderCell: CustomRowRenderer,
        }}
      />
    </div>
  );
}
