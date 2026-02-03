import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/layout";
import { Loader2 } from "lucide-react";

import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import AttendancePage from "@/pages/attendance";
import LeavesPage from "@/pages/leaves";
import SalaryPage from "@/pages/salary";
import DirectoryPage from "@/pages/directory";
import ApprovalsPage from "@/pages/approvals";
import EmployeesPage from "@/pages/employees";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/" />;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Common Pages */}
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/directory">
        <ProtectedRoute component={DirectoryPage} />
      </Route>

      {/* Employee Pages */}
      <Route path="/attendance">
        <ProtectedRoute component={AttendancePage} allowedRoles={["EMPLOYEE"]} />
      </Route>
      <Route path="/leaves">
        <ProtectedRoute component={LeavesPage} allowedRoles={["EMPLOYEE"]} />
      </Route>
      <Route path="/salary">
        <ProtectedRoute component={SalaryPage} allowedRoles={["EMPLOYEE"]} />
      </Route>

      {/* Manager Pages */}
      <Route path="/approvals">
        <ProtectedRoute component={ApprovalsPage} allowedRoles={["MANAGER"]} />
      </Route>
      <Route path="/employees">
        <ProtectedRoute component={EmployeesPage} allowedRoles={["MANAGER"]} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
