import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";
import api from "@/lib/api";

export function useTasks(projectId, { search, priority, status } = {}) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  // Socket.IO Subscription
  const socketRef = useRef(null);

  useEffect(() => {
    if (!projectId) return;

    let mounted = true;

    async function setupSocket() {
      const token = await getToken();
      
      if (socketRef.current?.connected) {
        socketRef.current.emit("join_project", projectId);
        return;
      }

      const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        if (mounted) socket.emit("join_project", projectId);
      });

      socket.on("task_created", (task) => {
        if (mounted) queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      });

      socket.on("task_updated", (updatedTask) => {
        if (mounted) queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      });

      socket.on("task_deleted", (taskId) => {
        if (mounted) queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      });
    }

    setupSocket();

    return () => {
      mounted = false;
      socketRef.current?.emit("leave_project", projectId);
    };
  }, [projectId, queryClient]);
  const query = useQuery({
    queryKey: ["tasks", projectId, { search, priority, status }],
    queryFn: async () => {
      const params = new URLSearchParams({ projectId });
      if (search) params.append("search", search);
      if (priority) params.append("priority", priority);
      if (status) params.append("status", status);
      
      const { data } = await api.get(`/tasks?${params.toString()}`);
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

  const addTaskMutation = useMutation({
    mutationFn: async (newTask) => {
      const { data } = await api.post(`/tasks`, { ...newTask, projectId });
      return data;
    },
    onMutate: async (newTask) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", projectId] });
      const previousTasks = queryClient.getQueryData(["tasks", projectId]);

      const optimisticTask = {
        ...newTask,
        id: `optimistic-${Date.now()}`,
        projectId,
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(["tasks", projectId], (old) => {
        if (!old) return [optimisticTask];
        return [...old, optimisticTask];
      });

      return { previousTasks };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(["tasks", projectId], context.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  return { ...query, updateTaskMutation, addTaskMutation };
}
