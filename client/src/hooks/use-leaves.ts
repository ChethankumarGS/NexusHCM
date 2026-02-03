import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertLeave } from "@shared/routes";
import { z } from "zod";

export function useLeaves(userId?: number) {
  return useQuery({
    queryKey: [api.leaves.list.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.leaves.list.path);
      // Query param handling would normally happen here if API supports it explicitly
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leaves");
      return api.leaves.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertLeave) => {
      const validated = api.leaves.create.input.parse(data);
      const res = await fetch(api.leaves.create.path, {
        method: api.leaves.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create leave request");
      return api.leaves.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leaves.list.path] });
    },
  });
}

export function useUpdateLeaveStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "APPROVED" | "REJECTED" }) => {
      const url = buildUrl(api.leaves.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.leaves.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.leaves.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.leaves.list.path] });
    },
  });
}
