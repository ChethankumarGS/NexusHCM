import { useAuth } from "@/hooks/use-auth";
import { useTodayAttendance, useClockIn, useClockOut, useAttendance } from "@/hooks/use-attendance";
import { useLeaves } from "@/hooks/use-leaves";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, CalendarDays, Users, TrendingUp, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

function StatCard({ title, value, subtext, icon: Icon, className }: any) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      </CardContent>
    </Card>
  );
}

function EmployeeDashboard() {
  const { user } = useAuth();
  const { data: today, isLoading: loadingToday } = useTodayAttendance();
  const { mutate: clockIn, isPending: isClockingIn } = useClockIn();
  const { mutate: clockOut, isPending: isClockingOut } = useClockOut();
  const { toast } = useToast();
  
  const handleClockIn = () => {
    clockIn(undefined, {
      onSuccess: () => toast({ title: "Clocked In", description: "Your attendance has been recorded." }),
      onError: (e) => toast({ variant: "destructive", title: "Error", description: e.message })
    });
  };

  const handleClockOut = () => {
    clockOut(undefined, {
      onSuccess: () => toast({ title: "Clocked Out", description: "Have a great evening!" }),
      onError: (e) => toast({ variant: "destructive", title: "Error", description: e.message })
    });
  };

  if (loadingToday) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-20" />;

  const isClockedIn = !!today?.clockIn && !today?.clockOut;
  const isClockedOut = !!today?.clockOut;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.fullName.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground">Here's your daily summary for {format(new Date(), "EEEE, MMMM do")}</p>
        </div>
        
        <div className="flex items-center gap-4 bg-card p-2 rounded-xl shadow-sm border">
          <div className="px-4 border-r">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</p>
            <p className={`font-bold ${isClockedIn ? "text-green-600" : "text-slate-500"}`}>
              {isClockedIn ? "Working" : isClockedOut ? "Finished" : "Not Started"}
            </p>
          </div>
          {isClockedIn ? (
             <Button 
               variant="destructive" 
               onClick={handleClockOut} 
               disabled={isClockingOut}
               className="shadow-lg shadow-destructive/20"
             >
               {isClockingOut ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Clock className="h-4 w-4 mr-2"/>}
               Clock Out
             </Button>
          ) : (
             <Button 
               onClick={handleClockIn} 
               disabled={isClockingIn || isClockedOut}
               className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
             >
               {isClockingIn ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Clock className="h-4 w-4 mr-2"/>}
               {isClockedOut ? "Day Complete" : "Clock In"}
             </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Hours Worked" 
          value={today?.clockIn ? "Running..." : "0h 0m"} 
          subtext="Today's tracked time"
          icon={Clock}
        />
        <StatCard 
          title="Leave Balance" 
          value="12 Days" 
          subtext="Remaining casual leave"
          icon={CalendarDays}
        />
        <StatCard 
          title="Efficiency" 
          value="94%" 
          subtext="Based on attendance"
          icon={TrendingUp}
        />
        <StatCard 
          title="Team Members" 
          value="8 Online" 
          subtext="In your department"
          icon={Users}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { name: "Mon", hours: 8.5 },
                { name: "Tue", hours: 7.8 },
                { name: "Wed", hours: 8.2 },
                { name: "Thu", hours: 8.0 },
                { name: "Fri", hours: 6.5 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}h`} />
                <Tooltip 
                  cursor={{fill: '#F1F5F9'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 shadow-sm">
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
            <CardDescription>Plan your leaves accordingly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Labor Day", date: "May 01", type: "Public Holiday" },
                { name: "Memorial Day", date: "May 29", type: "Public Holiday" },
                { name: "Team Outing", date: "Jun 15", type: "Company Event" },
              ].map((event, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-col leading-none">
                      <span>{event.date.split(" ")[0]}</span>
                      <span className="text-sm">{event.date.split(" ")[1]}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{event.name}</p>
                      <p className="text-xs text-muted-foreground">{event.type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ManagerDashboard() {
  const { data: leaves } = useLeaves();
  const { data: attendance } = useAttendance();

  const pendingLeaves = leaves?.filter(l => l.status === "PENDING").length || 0;
  
  // Dummy data for charts since we don't have aggregate endpoints yet
  const attendanceData = [
    { name: 'Present', value: 85, color: 'hsl(var(--primary))' },
    { name: 'Absent', value: 5, color: 'hsl(var(--destructive))' },
    { name: 'On Leave', value: 10, color: 'hsl(var(--accent))' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Manager Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Employees" value="124" subtext="Across 4 departments" icon={Users} />
        <StatCard title="Pending Approvals" value={pendingLeaves} subtext="Requires attention" icon={AlertCircle} className={pendingLeaves > 0 ? "border-amber-200 bg-amber-50 dark:bg-amber-950/20" : ""} />
        <StatCard title="On Leave Today" value="8" subtext="Scheduled absences" icon={CalendarDays} />
        <StatCard title="Attendance Rate" value="92%" subtext="Average this week" icon={TrendingUp} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Today's Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold">92%</span>
              <span className="text-xs text-muted-foreground uppercase">Present</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
            <CardDescription>Latest pending applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(leaves || []).filter(l => l.status === "PENDING").slice(0, 4).map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Leave Request #{leave.id}</p>
                    <p className="text-xs text-muted-foreground">{leave.reason}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p>{new Date(leave.startDate).toLocaleDateString()}</p>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium text-[10px] mt-1">Pending</span>
                  </div>
                </div>
              ))}
              {(leaves || []).filter(l => l.status === "PENDING").length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No pending requests</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === "MANAGER" ? <ManagerDashboard /> : <EmployeeDashboard />;
}
