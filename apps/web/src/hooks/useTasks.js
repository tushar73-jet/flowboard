import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";
import api from "@/lib/api";

export function useTasks(projectId) {
  const queryClient = useQueryClient();

  // Socket.IO Subscription
  useEffect(() => {
    if (!projectId) return;

    const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

    socket.emit("join_project", projectId);

    socket.on("task_created", (task) => {
      queryClient.setQueryData(["tasks", projectId], (old) => {
        if (!old) return [task];
        // Ensure no duplicates
        if (old.some(t => t.id === task.id)) return old;
        return [...old, task];
      });
    });

    socket.on("task_updated", (updatedTask) => {
      queryClient.setQueryData(["tasks", projectId], (old) => {
        if (!old) return [updatedTask];
        return old.map((t) => (t.id === updatedTask.id ? updatedTask : t));
      });
    });

    socket.on("task_deleted", (taskId) => {
      queryClient.setQueryData(["tasks", projectId], (old) => {
        if (!old) return [];
        return old.filter((t) => t.id !== taskId);
      });
    });

    return () => {
      socket.emit("leave_project", projectId);
      socket.disconnect();
    };
  }, [projectId, queryClient]);

  const query = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const { data } = await api.get(`/tasks?projectId=${projectId}`);
      return data;
    },
    enabled: !!projectId,
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask) => {
      const { data } = await api.put(`/tasks/${updatedTask.id}`, updatedTask);
      return data;
    },
    // Optimistic Update!
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", projectId] });
      const previousTasks = queryClient.getQueryData(["tasks", projectId]);
      
      queryClient.setQueryData(["tasks", projectId], (old) => 
        old.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
      );

      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["tasks", projectId], context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  return { ...query, updateTaskMutation };
}
