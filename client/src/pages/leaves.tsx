import { useState } from "react";
import { useLeaves, useCreateLeave } from "@/hooks/use-leaves";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api, type InsertLeave } from "@shared/routes";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";

export default function LeavesPage() {
  const [open, setOpen] = useState(false);
  const { data: leaves, isLoading } = useLeaves();
  const { mutate: createLeave, isPending } = useCreateLeave();
  const { toast } = useToast();

  const form = useForm<InsertLeave>({
    resolver: zodResolver(api.leaves.create.input),
    defaultValues: {
      userId: 1, // Will be overridden by backend or we need to pass current user id
      reason: "",
      startDate: "",
      endDate: "",
    },
  });

  const onSubmit = (data: InsertLeave) => {
    // Note: userId handling depends on backend. 
    // Usually backend extracts user from session. 
    // Here we assume backend handles it or we pass a placeholder.
    createLeave(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({ title: "Request Submitted", description: "Your leave request is pending approval." });
      },
      onError: (err) => {
        toast({ variant: "destructive", title: "Error", description: err.message });
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "APPROVED": return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case "REJECTED": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Leave Management</h2>
          <p className="text-muted-foreground">View your leave history and apply for new leaves.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
              <DialogDescription>Fill out the details below for your leave request.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Sick leave, vacation, personal..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Hidden userId field if needed by schema validation locally, though backend should override */}
                <input type="hidden" {...form.register("userId", { valueAsNumber: true })} value={1} />
                
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Request"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Applied On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaves?.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{format(new Date(leave.startDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{format(new Date(leave.endDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                    <TableCell>{getStatusBadge(leave.status)}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {leave.createdAt ? format(new Date(leave.createdAt), "MMM dd") : "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {leaves?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No leave requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
