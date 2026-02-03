import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  DollarSign, 
  LogOut, 
  Menu, 
  UserCircle,
  Clock,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const isManager = user.role === "MANAGER";

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ...(isManager ? [
      { name: "Employee Management", href: "/employees", icon: Users },
      { name: "Leave Approvals", href: "/approvals", icon: CalendarDays },
    ] : [
      { name: "Attendance", href: "/attendance", icon: Clock },
      { name: "Leave Requests", href: "/leaves", icon: Briefcase },
      { name: "Salary", href: "/salary", icon: DollarSign },
      { name: "Directory", href: "/directory", icon: Users },
    ]),
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Nexus HCM
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">Enterprise Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted cursor-pointer transition-colors">
              <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                <AvatarImage src={`https://ui-avatars.com/api/?name=${user.fullName}&background=random`} />
                <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.fullName}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 fixed inset-y-0 z-50">
        <SidebarContent />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b z-40 px-4 flex items-center justify-between">
        <span className="font-bold text-lg">Nexus HCM</span>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 animate-in fade-in duration-500">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
