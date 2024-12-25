"use client"
import TableGrid from "@/components/ui/table-grid/table-grid"
import dummyData from "@/data/dummy.json"
import type { Column } from "@/components/ui/table-grid/table-grid"
import { useTableGrid } from "@/hooks/use-table-grid"
import { useState, useEffect } from "react"
import { PiCaretDownFill, PiCaretUpFill, PiMagnifyingGlass } from "react-icons/pi"
import { FiAlertCircle } from "react-icons/fi"

interface DataItem extends Record<string, unknown> {
  id: number
  name: string
  age: number
  email: string
  department: string
  role: string
  status: string
}

const columns: Column<DataItem>[] = [
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
    sortable: true,
  },
  {
    id: "role",
    header: "Role",
    accessorKey: "role",
    sortable: true,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    sortable: true,
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
    sortable: true,
  },
]

// Custom Components
const CustomHeader = ({ 
  column, 
  sortIcon,
  onSort 
}: { 
  column: Column<DataItem>
  sortIcon?: React.ReactNode 
  onSort?: () => void
}) => {
  const sortDirection = sortIcon?.toString().includes("PiCaretUpFill") ? "asc" : "desc"
  
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="font-medium text-gray-700 dark:text-gray-200">
        {typeof column.header === 'function' ? column.header() : column.header}
      </span>
      {column.sortable && (
        <button
          onClick={onSort}
          className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          type="button"
        >
          {sortIcon ? (
            <div className="text-blue-500 dark:text-blue-400">
              {sortDirection === "asc" ? (
                <PiCaretUpFill size={16} />
              ) : (
                <PiCaretDownFill size={16} />
              )}
            </div>
          ) : (
            <PiCaretDownFill size={16} className="text-gray-400" />
          )}
        </button>
      )}
    </div>
  )
}

const CustomCell = ({ value, column }: { value: unknown; column: Column<DataItem> }) => {
  if (column.accessorKey === 'status') {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    }
    
    const status = String(value).toLowerCase()
    const colorClass = statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
        {String(value)}
      </span>
    )
  }

  return (
    <div className="px-4 py-3 text-gray-700 dark:text-gray-200">
      {String(value)}
    </div>
  )
}

const CustomEmptyState = () => (
  <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <FiAlertCircle className="w-12 h-12 text-gray-400 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Results Found</h3>
    <p className="text-gray-500 dark:text-gray-400 text-center mt-2 max-w-sm">
      We couldn&apos;t find any items matching your criteria. Try adjusting your search or filters.
    </p>
  </div>
)

const CustomLoadingState = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700 animate-pulse" />
      <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-blue-500 dark:border-blue-400 animate-spin border-t-transparent" />
    </div>
    <span className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading data...</span>
  </div>
)

const CustomSearchInput = ({ 
  value, 
  onChange, 
  placeholder 
}: { 
  value: string
  onChange: (value: string) => void
  placeholder?: string 
}) => (
  <div className="relative max-w-md w-full">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <PiMagnifyingGlass className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="block w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg 
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                placeholder-gray-500 dark:placeholder-gray-400
                transition-colors duration-200"
    />
  </div>
)

const CustomizedTable = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [showEmpty, setShowEmpty] = useState(false)

  const {
    filteredData,
    handleSort,
    sortColumn,
    sortDirection,
    setFilterValue,
    filterValue,
  } = useTableGrid<DataItem>({
    data: showEmpty ? [] : dummyData,
    columns,
    enableFuzzySearch: true,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Team Members
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your team members and their account permissions here.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsLoading((prev) => !prev)}
            className="inline-flex items-center px-4 py-2 border border-transparent 
                     text-sm font-medium rounded-lg shadow-sm text-white 
                     bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Toggle Loading
          </button>
          <button
            onClick={() => setShowEmpty((prev) => !prev)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 
                     dark:border-gray-600 text-sm font-medium rounded-lg shadow-sm 
                     text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 
                     hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none 
                     focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                     transition-colors"
          >
            Toggle Empty
          </button>
        </div>
      </div>

      <TableGrid<DataItem>
        columns={columns}
        data={filteredData}
        gridTemplateColumns="repeat(5, 1fr)"
        maxHeight="600px"
        variant="modern"
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        enableFuzzySearch={true}
        filterValue={filterValue}
        onFilterChange={setFilterValue}
        isLoading={isLoading}
        components={{
          Header: CustomHeader,
          Cell: CustomCell,
          EmptyState: CustomEmptyState,
          LoadingState: CustomLoadingState,
          SearchInput: CustomSearchInput,
        }}
        styleConfig={{
          container: {
            className: "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm",
          },
          headerCell: {
            className: "border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800",
          },
          row: {
            className: "border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors",
          },
          searchContainer: {
            className: "mb-4",
          },
        }}
      />
    </div>
  )
}

export default CustomizedTable 