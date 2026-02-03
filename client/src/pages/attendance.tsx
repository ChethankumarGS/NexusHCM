import { useAttendance } from "@/hooks/use-attendance";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function AttendancePage() {
  const { data: attendance, isLoading } = useAttendance();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance History</h2>
          <p className="text-muted-foreground">Track your daily clock-in and clock-out times.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
          <CardDescription>Showing all recorded work days</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance?.map((record) => {
                const clockIn = record.clockIn ? new Date(record.clockIn) : null;
                const clockOut = record.clockOut ? new Date(record.clockOut) : null;
                
                // Calculate duration in hours if both exist
                let duration = "-";
                if (clockIn && clockOut) {
                  const diff = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
                  duration = `${diff.toFixed(1)} hrs`;
                }

                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {format(new Date(record.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {clockIn ? format(clockIn, "hh:mm a") : "-"}
                    </TableCell>
                    <TableCell>
                      {clockOut ? format(clockOut, "hh:mm a") : "-"}
                    </TableCell>
                    <TableCell>{duration}</TableCell>
                    <TableCell>
                      {clockIn && !clockOut ? (
                        <Badge variant="outline" className="border-blue-500 text-blue-500 bg-blue-50">Active</Badge>
                      ) : clockIn && clockOut ? (
                        <Badge variant="outline" className="border-green-500 text-green-500 bg-green-50">Completed</Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-400 text-slate-500">Absent</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {attendance?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No attendance records found.
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
