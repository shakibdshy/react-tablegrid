# React Table Grid

A powerful and flexible table grid component for React applications with TailwindCSS support. Built with TypeScript and modern React patterns.

## Features

- 🔄 Dynamic Sorting
- 🔍 Advanced Filtering with Fuzzy Search
- 📌 Column Pinning (Left/Right)
- 👥 Header Groups
- 🎨 Custom Cell Rendering
- 🎯 TypeScript Support
- 💅 TailwindCSS Integration
- 📱 Responsive Design
- ⚡ Virtualization Support
- 🎛️ Customizable Components
- 🎨 Multiple Style Variants

## Installation

```bash
# Install with npm
npm install @shakibdshy/react-table-grid@1.0.0-beta.1

# Or with yarn
bun add @shakibdshy/react-table-grid@1.0.0-beta.1
```

## Basic Usage

```tsx
import { useTableGrid, TableGrid, Column } from "react-table-grid";
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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Md. Habibur Rahman]
