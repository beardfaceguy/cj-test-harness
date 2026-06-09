import { Task, TaskStatus, Priority } from "../types";
import { apiClient } from "./client";

export interface TaskCreate {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  assigneeId?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export async function listTasks(
  projectId: string,
  status?: TaskStatus
): Promise<Task[]> {
  const params = status ? { status } : undefined;
  const { data } = await apiClient.get<Task[]>(
    `/projects/${projectId}/tasks/`,
    { params }
  );
  return data;
}

export async function getTask(
  projectId: string,
  taskId: string
): Promise<Task> {
  const { data } = await apiClient.get<Task>(
    `/projects/${projectId}/tasks/${taskId}`
  );
  return data;
}

export async function createTask(
  projectId: string,
  payload: TaskCreate
): Promise<Task> {
  const { data } = await apiClient.post<Task>(
    `/projects/${projectId}/tasks/`,
    payload
  );
  return data;
}

export async function updateTask(
  projectId: string,
  taskId: string,
  payload: TaskUpdate
): Promise<Task> {
  const { data } = await apiClient.patch<Task>(
    `/projects/${projectId}/tasks/${taskId}`,
    payload
  );
  return data;
}

export async function deleteTask(
  projectId: string,
  taskId: string
): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/tasks/${taskId}`);
}
