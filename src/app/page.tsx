import BasicTable from "@/components/examples/basic-table";
import BasicSearch from "@/components/examples/basic-search";
import HeaderGroupsTable from "@/components/examples/header-groups";
// import FuzzySearchFilter from "@/components/examples/fuzzy-search-filter";
// import NestedTableExample from "@/components/examples/nested-table";
// import ToggleColumnPinningTable from "@/components/examples/toggle-column-pinning-table";
// import ColumnPinningTable from "@/components/examples/column-pinning-table";
// import ColumnVisibilityTable from "@/components/examples/column-visibility-table";
// import VirtualizedTable from "@/components/examples/virtualized-table";
// import ColumnResizingTable from "@/components/examples/column-resizing-table";
import CustomizedTable from "@/components/examples/customized-table";
import PaginationExample from "@/components/examples/pagination";

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <BasicTable />
      <BasicSearch />
      <HeaderGroupsTable />
      {/* <FuzzySearchFilter /> */}
      {/* <NestedTableExample /> */}
      {/* <ToggleColumnPinningTable /> */}
      {/* <ColumnPinningTable /> */}
      {/* <ColumnVisibilityTable /> */}
      {/* <VirtualizedTable /> */}
      {/* <ColumnResizingTable /> */}
      <CustomizedTable />
      <PaginationExample />

    </main>
  );
}
