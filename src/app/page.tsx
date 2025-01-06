// import BasicTable from "@/components/examples/basic-table";
// import HeaderGroupsTable from "@/components/examples/header-groups";
// import BasicSearch from "@/components/examples/basic-search";
// import FuzzySearchFilter from "@/components/examples/fuzzy-search-filter";
// import ColumnVisibilityTable from "@/components/examples/column-visibility-table";
import ColumnPinningTable from "@/components/examples/column-pinning-table";
// import CustomizedTable from "@/components/examples/customized-table";
// import ColumnResizingTable from "@/components/examples/column-resizing-table";
// import VirtualizedTable from "@/components/examples/virtualized-table";
// import ToggleColumnPinningTable from "@/components/examples/toggle-column-pinning-table";

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      {/* <BasicTable />
      <BasicSearch />
      <HeaderGroupsTable /> */}
      <ColumnPinningTable />
      {/* <ToggleColumnPinningTable /> */}
      {/* <VirtualizedTable />
      <ColumnResizingTable />
      <div className="space-y-8">
        <div className="border rounded-lg">
          <CustomizedTable />
        </div>        
        <ColumnVisibilityTable />

        <FuzzySearchFilter />
      </div> */}
    </main>
  );
}
