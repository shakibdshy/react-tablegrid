import BasicTable from "@/components/examples/basic-table";
// import HeaderGroupsTable from "@/components/examples/header-groups";
// import BasicSearch from "@/components/examples/basic-search";
// import FuzzySearchFilter from "@/components/examples/fuzzy-search-filter";
// import ColumnVisibilityTable from "@/components/examples/column-visibility-table";
// import ColumnPinningTable from "@/components/examples/toggle-column-pinning-table";
// import CustomizedTable from "@/components/examples/customized-table";
// import ColumnResizingTable from "@/components/examples/column-resizing-table";
// import VirtualizedTable from "@/components/examples/virtualized-table";

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <BasicTable />
      {/* <BasicSearch /> */}
      {/* <VirtualizedTable /> */}
      {/* <BasicTable />
      <ColumnResizingTable />
      <div className="space-y-8">
        <div className="border rounded-lg">
          <CustomizedTable />
        </div>
        <ColumnPinningTable />
        <ColumnVisibilityTable />
        <HeaderGroupsTable />
        
        <FuzzySearchFilter />
      </div> */}
    </main>
  );
}