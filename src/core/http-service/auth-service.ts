import { LoginRequest, LoginResponse } from "@/types/auth.interface";
import { createData } from "./http-service";

const AUTH_ENDPOINTS = {
  LOGIN: "/users/login",
} as const;

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return await createData<LoginRequest, LoginResponse>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );
  },
};
