import BasicTable from "@/components/containers/basic-table";
import HeaderGroupsTable from "@/components/containers/header-groups";
import BasicSearch from "@/components/containers/basic-search";
import FuzzySearchFilter from "@/components/containers/fuzzy-search-filter";
import ColumnVisibilityTable from "@/components/containers/column-visibility-table";
import ColumnPinningTable from "@/components/containers/toggle-column-pinning-table";
import CustomizedTable from "@/components/containers/customized-table";

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <div className="space-y-8">
        <div className="border rounded-lg">
          <CustomizedTable />
        </div>
        <ColumnPinningTable />
        <ColumnVisibilityTable />
        <BasicTable />
        <HeaderGroupsTable />
        <BasicSearch />
        <FuzzySearchFilter />
      </div>
    </main>
  );
}
