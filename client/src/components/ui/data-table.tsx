import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string;
    cell: (row: T) => React.ReactNode;
  }[];
}

export function DataTable<T>({ data, columns }: DataTableProps<T>) {
  return (
    <div className="rounded-md border border-gray-200/80">
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-50/50 hover:bg-blue-100/60">
            {columns.map((column, i) => (
              <TableHead key={i} className="px-6 py-4 text-left text-sm font-semibold text-blue-900/90 whitespace-nowrap">
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i} className={`transition-colors duration-200 ${i % 2 === 0 ? 'bg-white' : 'bg-blue-50/30'} hover:bg-blue-100/50`}>
              {columns.map((column, j) => (
                <TableCell key={j} className="px-6 py-4 whitespace-nowrap">
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
