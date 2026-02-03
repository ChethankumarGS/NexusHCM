import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useSalaries() {
  return useQuery({
    queryKey: [api.salaries.list.path],
    queryFn: async () => {
      const res = await fetch(api.salaries.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch salaries");
      return api.salaries.list.responses[200].parse(await res.json());
    },
  });
}
