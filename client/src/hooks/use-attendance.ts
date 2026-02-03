import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useAttendance(userId?: number) {
  return useQuery({
    queryKey: [api.attendance.list.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.attendance.list.path);
      const params = userId ? `?userId=${userId}` : '';
      const res = await fetch(url + params, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch attendance");
      return api.attendance.list.responses[200].parse(await res.json());
    },
  });
}

export function useTodayAttendance() {
  return useQuery({
    queryKey: [api.attendance.today.path],
    queryFn: async () => {
      const res = await fetch(api.attendance.today.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch today's attendance");
      const data = await res.json();
      return api.attendance.today.responses[200].parse(data);
    },
  });
}

export function useClockIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.attendance.clockIn.path, {
        method: api.attendance.clockIn.method,
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to clock in");
      }
      return api.attendance.clockIn.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.attendance.today.path] });
      queryClient.invalidateQueries({ queryKey: [api.attendance.list.path] });
    },
  });
}

export function useClockOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.attendance.clockOut.path, {
        method: api.attendance.clockOut.method,
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to clock out");
      }
      return api.attendance.clockOut.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.attendance.today.path] });
      queryClient.invalidateQueries({ queryKey: [api.attendance.list.path] });
    },
  });
}
