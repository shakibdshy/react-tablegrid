"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TableContainer } from "@/components/containers/table-container/table-container";
import { Pagination } from "@shakibdshy/react-pagination-pro";
import type { Column } from "@/types/column.types";
import { createColumnHelper } from "@/utils/column-helper";

interface Product extends Record<string, unknown> {
  id: number;
  title: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  rating: number;
  stock: number;
}

interface ApiResponse {
  statusCode: number;
  data: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    data: Product[];
  };
  message: string;
  success: boolean;
}

export default function PaginationExample() {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Define columns for the table
  const columnHelper = createColumnHelper<Product>();

  const columns: Column<Product>[] = [
    columnHelper.accessor("id", {
      header: "ID",
      sortable: false,
      pinned: "left",
    }),

    columnHelper.accessor("title", {
      header: "Title",
      sortable: false,
    }),

    columnHelper.accessor("brand", {
      header: "Brand",
      sortable: false,
    }),

    columnHelper.accessor("category", {
      header: "Category",
      sortable: false,
    }),

    columnHelper.accessor("price", {
      header: "Price",
      sortable: false,
    }),

    columnHelper.accessor("rating", {
      header: "Rating",
      sortable: false,
    }),

    columnHelper.accessor("stock", {
      header: "Stock",
      sortable: false,
    }),
  ];

  // Fetch data using react-query
  const { data: apiResponse, isLoading } = useQuery<ApiResponse>({
    queryKey: ["products", currentPage],
    queryFn: async () => {
      const response = await fetch(
        `https://api.freeapi.app/api/v1/public/randomproducts?page=${currentPage}&limit=${limit}`
      );
      return response.json();
    },
  });

  const handlePageChange = async (options: {
    page: number;
    pageSize: number;
    sortColumn?: keyof Product;
    sortDirection?: "asc" | "desc";
    filters?: Record<string, unknown>;
  }): Promise<Product[]> => {
    setCurrentPage(options.page);
    const response = await fetch(
      `https://api.freeapi.app/api/v1/public/randomproducts?page=${options.page}&limit=${options.pageSize}`
    );
    const result = (await response.json()) as ApiResponse;
    return result.data.data;
  };

  return (
    <div className="space-y-4">
      <TableContainer
        data={apiResponse?.data?.data ?? []}
        columns={columns}
        maxHeight="600px"
        isLoading={isLoading}
        serverSide={{
          enabled: true,
          pageSize: limit,
          totalRows: apiResponse?.data?.totalItems ?? 0,
          currentPage: currentPage,
          loading: isLoading,
          onFetch: handlePageChange,
        }}
      />

      {apiResponse?.data && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {limit} items per page
          </div>
          <Pagination
            currentPage={currentPage}
            pageSize={limit}
            totalItems={apiResponse.data.totalItems}
            onChange={(state) =>
              handlePageChange({
                page: state.currentPage,
                pageSize: state.pageSize,
              })
            }
            className="pagination-container"
          />
        </div>
      )}
    </div>
  );
}
