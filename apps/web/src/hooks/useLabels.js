import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export function useLabels(workspaceId) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["labels", workspaceId],
    queryFn: async () => {
      const { data } = await api.get(`/labels?workspaceId=${workspaceId}`);
      return data;
    },
    enabled: !!workspaceId,
  });

  const createLabelMutation = useMutation({
    mutationFn: async (newLabel) => {
      const { data } = await api.post("/labels", { ...newLabel, workspaceId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["labels", workspaceId] });
    },
  });

  return { ...query, createLabelMutation };
}
