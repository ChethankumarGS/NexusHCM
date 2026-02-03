import { useUsers } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2 } from "lucide-react";

export default function EmployeesPage() {
  const { data: users, isLoading } = useUsers();

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employee Management</h2>
          <p className="text-muted-foreground">Administrative control for all user accounts.</p>
        </div>
        {/* Add Employee Dialog would go here */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <CardDescription>Total {users?.length} registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{user.id}
                  </TableCell>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "MANAGER" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.department || "-"}</TableCell>
                  <TableCell>{user.title || "-"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
