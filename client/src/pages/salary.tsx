import { useSalaries } from "@/hooks/use-salaries";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

export default function SalaryPage() {
  const { data: salaries, isLoading } = useSalaries();

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-20" />;

  // Currency formatter
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Salary Slips</h2>
        <p className="text-muted-foreground">View your monthly earnings and deductions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>Confidential financial records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month/Year</TableHead>
                <TableHead>Basic Salary</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Payable</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaries?.map((salary) => {
                // Mock parsing details JSON, assuming simple structure or just displaying raw if text
                let details: any = {};
                try {
                  details = JSON.parse(salary.details || "{}");
                } catch {
                  // ignore
                }
                
                return (
                  <TableRow key={salary.id}>
                    <TableCell className="font-medium">
                      {salary.month} {salary.year}
                    </TableCell>
                    <TableCell>{formatter.format(salary.amount)}</TableCell>
                    <TableCell className="text-destructive">
                      {formatter.format(details.deductions || 0)}
                    </TableCell>
                    <TableCell className="font-bold text-green-600">
                      {formatter.format(salary.amount - (details.deductions || 0))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {salaries?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No salary records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
