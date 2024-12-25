import BasicTable from "@/components/containers/basic-table";
import HeaderGroupsTable from "@/components/containers/header-groups";
import BasicSearch from "@/components/containers/basic-search";
import FuzzySearchFilter from "@/components/containers/fuzzy-search-filter";
import ColumnVisibilityTable from "@/components/containers/column-visibility-table";

export default function Home() {
  return (
    <div>
      <ColumnVisibilityTable />
      <BasicTable />
      <HeaderGroupsTable />
      <BasicSearch />
      <FuzzySearchFilter />
    </div>
  );
}
