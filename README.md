# React Table Grid

A powerful and flexible table grid component for React applications with TailwindCSS support. Built with TypeScript and modern React patterns.

[![npm version](https://img.shields.io/npm/v/@shakibdshy/react-tablegrid.svg)](https://www.npmjs.com/package/@shakibdshy/react-tablegrid)
[![npm downloads](https://img.shields.io/npm/dm/@shakibdshy/react-tablegrid.svg)](https://www.npmjs.com/package/@shakibdshy/react-tablegrid)
[![License](https://img.shields.io/npm/l/@shakibdshy/react-tablegrid.svg)](https://github.com/shakibdshy/react-tablegrid/blob/main/LICENSE)

## Demo & Documentation (Updated)

[Demo](https://react-packages-doc.vercel.app/docs/react-tablegrid)

## Installation

```bash
# Install with npm
npm install @shakibdshy/react-tablegrid

# Or with yarn
yarn add @shakibdshy/react-tablegrid

# Or with pnpm
pnpm add @shakibdshy/react-tablegrid
```

## Setup

```tsx
 
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // ... your content configuration
    "node_modules/@shakibdshy/react-tablegrid/dist/**/*.{js,ts,jsx,tsx}",
  ],
};

```

## Features

- 🔄 Dynamic Sorting & Server-side Sorting
- 🔍 Advanced Filtering with Fuzzy Search
- 📌 Column Pinning (Left/Right)
- 📏 Column Resizing with Drag & Drop
- 👥 Header Groups & Nested Headers
- 🎨 Custom Cell & Header Rendering
- 🎯 Full TypeScript Support
- 💅 TailwindCSS Integration
- 📱 Responsive Design
- ⚡ Virtualization Support for Large Datasets
- 🎛️ Customizable Components & Styling
- 🎨 Multiple Style Variants
- 🔄 Column Visibility Toggle
- 📍 Dynamic Column Pinning
- 🔄 Row Selection & Bulk Actions
- 📊 Row Grouping
- 🔍 Advanced Search with Multiple Fields
- 💾 Persistent State Management
- 🔄 Server-side Pagination
- 📱 Touch & Mobile Support

## Basic Usage

```tsx
type DataItem = {
  id: number;
  name: string;
  age: number;
  email: string;
};

const columnHelper = createColumnHelper<DataItem>();

const columns: Column<DataItem>[] = [
  columnHelper.accessor("name", {
    header: "Name",
    sortable: false,
  }),
  columnHelper.accessor("age", {
    header: "Age",
    sortable: false,
  }),
  columnHelper.accessor("email", {
    header: "Email",
    sortable: false,
  }),
];

const BasicTable = () => {
  return (
    <div className="p-4">      
      <TableContainer
        columns={columns}
        data={dummyData}
        maxHeight="400px"
        variant="modern"
        onStateChange={(state) => {
          console.log("Table state changed:", state);
        }}
      />
    </div>
  );
};

export default BasicTable;

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
| `serverSideConfig` | `ServerSideConfig` | - | Server-side data handling configuration |
| `virtualizationConfig` | `VirtualizationConfig` | - | Configuration for virtualization |
| `enableRowSelection` | `boolean` | `false` | Enable row selection |
| `enableRowGrouping` | `boolean` | `false` | Enable row grouping |
| `persistState` | `boolean` | `false` | Enable state persistence |
| `stateKey` | `string` | - | Key for persisting state |
| `onBulkAction` | `(selectedRows: T[]) => void` | - | Handler for bulk actions |
| `touchConfig` | `TouchConfig` | - | Touch interaction configuration |

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
  groupable?: boolean;
  nestedHeaders?: Column<T>[];
  cell?: (props: {
    value: T[keyof T];
    row: T;
    onChange?: (value: T[keyof T]) => void;
    onDelete?: () => void;
  }) => ReactNode;
}
```

### Server-Side Configuration

```tsx
interface ServerSideConfig {
  enabled: boolean;
  totalRows: number;
  pageSize: number;
  onFetch: (params: {
    page: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
  }) => Promise<T[]>;
}
```

### Virtualization Configuration

```tsx
interface VirtualizationConfig {
  enabled: boolean;
  rowHeight: number;
  overscan?: number;
  scrollThreshold?: number;
}
```

### Touch Configuration

```tsx
interface TouchConfig {
  enabled: boolean;
  swipeThreshold?: number;
  longPressDelay?: number;
  dragEnabled?: boolean;
}
```

### Style Configuration

```tsx
interface TableStyleConfig {
  container?: {
    className?: string;
    style?: React.CSSProperties;
    wrapperClassName?: string;
    scrollContainerClassName?: string;
    tableClassName?: string;
  };
  header?: {
    className?: string;
    style?: React.CSSProperties;
    headerRowClassName?: string;
    headerCellClassName?: string;
    headerGroupClassName?: string;
  };

  body?: {
    style?: React.CSSProperties;
    className?: string;
    rowClassName?: string;
    cellClassName?: string;
  };

  resizer?: {
    className?: string;
    style?: React.CSSProperties;
  };

  resizerIndicator?: {
    className?: string;
    style?: React.CSSProperties;
  };

  sortButton?: {
    className?: string;
    style?: React.CSSProperties;
  };

  utilityStyles?: {
    emptyClassName?: string;
    searchContainerClassName?: string;
    searchInputClassName?: string;
    loadingClassName?: string;
    style?: React.CSSProperties;
  };
}
```

### Additional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columnResizeMode` | `"onChange" \| "onResize" \| "drag"` | `"onChange"` | When to update column sizes |
| `onColumnResize` | `(columnId: string, width: number) => void` | - | Column resize handler |
| `columnSizing` | `{ columnSizes: { [key: string]: number } }` | - | Column width states |
| `onColumnPin` | `(columnId: keyof T, position: 'left' \| 'right' \| false) => void` | - | Column pin handler |
| `onStateChange` | `(state: TableState) => void` | - | Table state change handler |
| `onRowSelect` | `(selectedRows: T[]) => void` | - | Row selection handler |
| `onGroupChange` | `(groups: string[]) => void` | - | Row grouping change handler |

## Version History

- v2.1.0 - Enhance table component styling and customization
  - Added new className and style props for more granular styling control
  - Introduced rtg-* class names for better semantic targeting
  - Updated TableStyleConfig to support more detailed styling options
  - Improved hover and transition effects across table components
  - Added support for custom row and cell styling in table body

- v2.0.0 - Major Release
  - Added server-side data handling
  - Enhanced virtualization for large datasets
  - Improved column management with drag & drop
  - Added row grouping functionality
  - Enhanced TypeScript support
  - Added persistent state management
  - Improved mobile & touch support
  - Added bulk actions for selected rows
  - Enhanced search capabilities
  - Added nested header groups
  - Performance optimizations
- v1.2.0-beta.1 - Added column resizing and toggle column pinning features
- v1.1.0 - Initial stable release
- v1.0.0 - Initial release

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Md. Habibur Rahman]
