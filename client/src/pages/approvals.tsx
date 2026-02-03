import { useLeaves, useUpdateLeaveStatus } from "@/hooks/use-leaves";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApprovalsPage() {
  const { data: leaves, isLoading } = useLeaves();
  const { mutate: updateStatus, isPending } = useUpdateLeaveStatus();
  const { toast } = useToast();

  const pendingLeaves = leaves?.filter(l => l.status === "PENDING") || [];

  const handleAction = (id: number, status: "APPROVED" | "REJECTED") => {
    updateStatus({ id, status }, {
      onSuccess: () => {
        toast({ title: `Leave ${status.toLowerCase()}`, description: "The employee has been notified." });
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Error", description: err.message });
      }
    });
  };

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin mx-auto mt-20" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Leave Approvals</h2>
        <p className="text-muted-foreground">Review and manage pending leave requests.</p>
      </div>

      <div className="grid gap-4">
        {pendingLeaves.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground border-dashed">
            <p>All caught up! No pending requests.</p>
          </Card>
        ) : (
          pendingLeaves.map((leave) => (
            <Card key={leave.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                    {/* Assuming we might fetch user details or just show placeholder */}
                    <AvatarFallback>U{leave.userId}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">Employee #{leave.userId}</h3>
                    <Badge variant="secondary" className="mt-1">Pending Review</Badge>
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">
                      {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reason</p>
                    <p className="font-medium text-pretty">{leave.reason}</p>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleAction(leave.id, "REJECTED")}
                    disabled={isPending}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleAction(leave.id, "APPROVED")}
                    disabled={isPending}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
