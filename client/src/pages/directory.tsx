import { useState } from "react";
import { useUsers } from "@/hooks/use-users";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, Mail, Building2 } from "lucide-react";

export default function DirectoryPage() {
  const { data: users, isLoading } = useUsers();
  const [search, setSearch] = useState("");

  const filteredUsers = users?.filter(user => 
    user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    user.department?.toLowerCase().includes(search.toLowerCase()) ||
    user.title?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-20" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employee Directory</h2>
          <p className="text-muted-foreground">Connect with your colleagues.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, dept..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers?.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${user.fullName}&background=random`} />
                <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <CardTitle className="text-lg">{user.fullName}</CardTitle>
                <CardDescription className="font-medium text-primary">{user.title || "Employee"}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{user.department || "General Department"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="truncate">{user.email || "No email provided"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
