import { Project } from "../types";
import { apiClient } from "./client";

export interface ProjectCreate {
  name: string;
  description?: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
}

export async function listProjects(): Promise<Project[]> {
  const { data } = await apiClient.get<Project[]>("/projects/");
  return data;
}

export async function getProject(projectId: string): Promise<Project> {
  const { data } = await apiClient.get<Project>(`/projects/${projectId}`);
  return data;
}

export async function createProject(payload: ProjectCreate): Promise<Project> {
  const { data } = await apiClient.post<Project>("/projects/", payload);
  return data;
}

export async function updateProject(
  projectId: string,
  payload: ProjectUpdate
): Promise<Project> {
  const { data } = await apiClient.patch<Project>(
    `/projects/${projectId}`,
    payload
  );
  return data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}`);
}
