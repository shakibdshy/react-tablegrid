# React Table Grid (Beta)

A powerful and flexible table grid component for React applications with TailwindCSS support. Built with TypeScript and modern React patterns.

## Demo

[Example Demo](https://github.com/shakibdshy/react-tablegrid/blob/master/src/components/containers/basic-table.tsx)

## Prerequisites

Before installing this package, make sure you have the following peer dependencies installed in your project:

```bash
# Required peer dependencies
npm install react@>=16.8.0 react-dom@>=16.8.0 tailwindcss@^3.4.1

# If using TypeScript (recommended)
npm install @types/react@^19.0.0
```

## Installation

```bash
# Install with npm
npm install @shakibdshy/react-tablegrid

# Or with yarn
yarn add @shakibdshy/react-tablegrid

# Or with pnpm
pnpm add @shakibdshy/react-tablegrid
```

## Features

- 🔄 Dynamic Sorting
- 🔍 Advanced Filtering with Fuzzy Search
- 📌 Column Pinning (Left/Right)
- 📏 Column Resizing
- 👥 Header Groups
- 🎨 Custom Cell Rendering
- 🎯 TypeScript Support
- 💅 TailwindCSS Integration
- 📱 Responsive Design
- ⚡ Virtualization Support
- 🎛️ Customizable Components
- 🎨 Multiple Style Variants
- 🔄 Toggle Column Visibility
- 📍 Toggle Column Pinning

## Basic Usage

```tsx
import { useTableGrid, TableGrid, Column } from "@shakibdshy/react-tablegrid";
import dummyData from "@/data/dummy.json";

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

```

## Advanced Features

### Toggle Column with Pinning

```tsx
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

```

### Column Resizing

```tsx
const ResizableTable = () => {
  const {
    filteredData,
    columnSizing,
    handleColumnResize,
  } = useTableGrid<DataItem>({
    data: dummyData,
    columns,
    columnResizeMode: 'onChange'
  });

  return (
    <div className="p-4">      
      <TableGrid<DataItem>
        columns={columns}
        data={filteredData}
        columnSizing={columnSizing}
        onColumnResize={handleColumnResize}
        columnResizeMode="onChange"
      />
    </div>
  );
};
```

### Column Pinning

```tsx
const columnHelper = createColumnHelper<DataItem>();

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    sortable: true,
    pinned: "left",
  }),
  columnHelper.accessor("name", {
    header: "Name",
    sortable: true,
  }),
  columnHelper.accessor("salary", {
    header: "Salary",
    sortable: true,
    cell: ({ value }) => `$${(value as number).toLocaleString()}`,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    sortable: true,
  }),
  columnHelper.accessor("location", {
    header: "Location",
    sortable: true,
  }),
  columnHelper.accessor("joinDate", {
    header: "Join Date",
    sortable: true,
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    sortable: true,
  }),
];
```

### Header Groups

```tsx
const columnHelper = createColumnHelper<DataItem>();
const columns = [
    columnHelper.accessor("joinDate", {
        header: "Join Date",
        sortable: true,
        group: "Personal Info"
    }),
    columnHelper.accessor("phone", {
        header: "Phone",
        sortable: true,
        group: "Contact Info"
    }),
];

<TableGrid 
  columns={columns} 
  data={data} 
  headerGroups={true} 
/>
```

### Custom Components

```tsx
const CustomHeader = ({ column, sortIcon, onSort }) => (
  <div onClick={onSort} className="cursor-pointer">
    {column.header} {sortIcon}
  </div>
);

const CustomCell = ({ value, row, column }) => (
  <div className="custom-cell">
    {value}
  </div>
);

<TableGrid
  columns={columns}
  data={data}
  components={{
    Header: CustomHeader,
    Cell: CustomCell,
    EmptyState: CustomEmptyState,
    LoadingState: CustomLoadingState,
    SearchInput: CustomSearchInput
  }}
/>
```

### Style Variants

```tsx
<TableGrid
  variant="modern" // or "minimal" | "classic"
  styleConfig={{
    container: {
      className: "custom-container",
      style: { background: "#fff" }
    },
    header: {
      className: "custom-header"
    },
    // ... more style configurations
  }}
/>
```

## API Reference

### TableProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `Column[]` | Required | Array of column definitions |
| `data` | `T[]` | Required | Array of data objects |
| `variant` | `"modern" \| "minimal" \| "classic"` | `"modern"` | Table style variant |
| `enableFiltering` | `boolean` | `false` | Enable basic filtering |
| `enableFuzzySearch` | `boolean` | `false` | Enable fuzzy search |
| `fuzzySearchKeys` | `Array<keyof T>` | All columns | Keys to include in fuzzy search |
| `fuzzySearchThreshold` | `number` | `0.3` | Fuzzy search sensitivity |
| `maxHeight` | `string` | `"400px"` | Maximum height of table |
| `gridTemplateColumns` | `string` | `"1fr"` | CSS grid template columns |
| `headerGroups` | `boolean` | `false` | Enable header grouping |
| `isLoading` | `boolean` | `false` | Show loading state |

### Column Definition

```tsx
interface Column<T> {
  id: keyof T;
  header: ReactNode | (() => ReactNode);
  accessorKey: keyof T;
  sortable?: boolean;
  className?: string;
  width?: string;
  group?: string;
  pinned?: 'left' | 'right' | false;
  cell?: (props: {
    value: T[keyof T];
    row: T;
    onChange?: (value: T[keyof T]) => void;
    onDelete?: () => void;
  }) => ReactNode;
}
```

### Style Configuration

```tsx
interface TableStyleConfig {
  container?: {
    className?: string;
    style?: React.CSSProperties;
  };
  header?: {
    className?: string;
    style?: React.CSSProperties;
  };
  row?: {
    className?: string;
    style?: React.CSSProperties;
  };
  cell?: {
    className?: string;
    style?: React.CSSProperties;
  };
  // ... more style options
}
```

### Additional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columnResizeMode` | `"onChange" \| "onResize"` | `"onChange"` | When to update column sizes |
| `onColumnResize` | `(columnId: string, width: number) => void` | - | Column resize handler |
| `columnSizing` | `{ columnSizes: { [key: string]: number } }` | - | Column width states |
| `onColumnPin` | `(columnId: keyof T, position: 'left' \| 'right' \| false) => void` | - | Column pin handler |

## Version History

- v1.2.0 - Added column resizing and toggle column pinning features
- v1.0.0 - Initial release

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Md. Habibur Rahman]
