import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} from "../api/tasks";
import type { TaskCreate, TaskUpdate } from "../api/tasks";
import type { TaskStatus } from "../types";

export function useTasks(projectId: string, status?: TaskStatus) {
  return useQuery({
    queryKey: ["tasks", projectId, status],
    queryFn: () => listTasks(projectId, status),
    enabled: Boolean(projectId),
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaskCreate) => createTask(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}

export function useUpdateTask(projectId: string, taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TaskUpdate) => updateTask(projectId, taskId, payload),
    onSuccess: () => {
      // so the task list never refreshes after a status/priority update
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => deleteTask(projectId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });
}
