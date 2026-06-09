import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, login, logout, register } from "../api/auth";
import type { RegisterPayload } from "../api/auth";

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    logout();
    queryClient.clear();
  };
}
