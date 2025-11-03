import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface TruthTableProps {
  variables: string[];
  results: boolean[];
}

export const TruthTable = ({ variables, results }: TruthTableProps) => {
  const numVars = variables.length;
  const numRows = Math.pow(2, numVars);

  const generateRow = (index: number): boolean[] => {
    const row: boolean[] = [];
    for (let i = numVars - 1; i >= 0; i--) {
      row.unshift(Boolean((index >> i) & 1));
    }
    return row;
  };

  return (
    <Card className="shadow-[var(--shadow-soft)]">
      <CardHeader>
        <CardTitle className="text-xl">Truth Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                {variables.map((variable) => (
                  <TableHead key={variable} className="text-center font-bold">
                    {variable}
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold bg-primary/10">Output</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: numRows }).map((_, index) => {
                const row = generateRow(index);
                return (
                  <TableRow key={index} className="hover:bg-secondary/30 transition-colors">
                    {row.map((value, i) => (
                      <TableCell key={i} className="text-center">
                        {value ? "1" : "0"}
                      </TableCell>
                    ))}
                    <TableCell className="text-center font-semibold bg-primary/5">
                      {results[index] ? "1" : "0"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
