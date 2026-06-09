import { AuthToken, User } from "../types";
import { apiClient } from "./client";

export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const { data } = await apiClient.post<User>("/auth/register", payload);
  return data;
}

export async function login(email: string, password: string): Promise<AuthToken> {
  const form = new URLSearchParams({ username: email, password });
  const { data } = await apiClient.post<AuthToken>("/auth/token", form, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  localStorage.setItem("access_token", data.access_token);
  return data;
}

// BUG-N5: logout is sync but named without 'sync' — callers await it unnecessarily
export function logout(): void {
  localStorage.removeItem("access_token");
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/users/me");
  return data;
}
