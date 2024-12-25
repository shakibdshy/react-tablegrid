import TableGrid from "@/components/ui/table-grid";
import dummyData from "@/data/dummy.json";

const columns = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "age", header: "Age", accessorKey: "age" },
  { id: "email", header: "Email", accessorKey: "email" },
];

const BasicTable = () => {
  return (
    <div>
      <TableGrid
        columns={columns}
        data={dummyData}
        gridTemplateColumns="1fr 1fr 1fr"
        maxHeight="800px"
      />
    </div>
  );
};

export default BasicTable;
