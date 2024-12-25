import BasicTable from "@/components/containers/basic-table";
import HeaderGroupsTable from "@/components/containers/header-groups";
import BasicSearch from "@/components/containers/basic-search";

export default function Home() {
  return (
    <div>
      <BasicTable />
      <HeaderGroupsTable />
      <BasicSearch />
    </div>
  );
}
