"use client";

import { authService } from "@/core/http-service/auth-service";
import { AuthContextType, User } from "@/types/auth.interface";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "talasys_access_token";
const USER_KEY = "talasys_user";

// Helper function to set cookie
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// Helper function to remove cookie
const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to clear auth state
  const clearAuthState = () => {
    setToken(null);
    setUser(null);
  };

  // Load token and user from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        removeCookie(TOKEN_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Listen for storage changes (when HTTP service logs out user)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === TOKEN_KEY && e.newValue === null) {
        clearAuthState();
        toast.error("جلسه شما منقضی شده است. لطفاً دوباره وارد شوید.");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Check for token on focus (in case it was removed by another tab/window)
  useEffect(() => {
    const handleFocus = () => {
      const currentToken = localStorage.getItem(TOKEN_KEY);
      if (!currentToken && token) {
        clearAuthState();
        toast.error("جلسه شما منقضی شده است. لطفاً دوباره وارد شوید.");
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authService.login({ email, password });

      // For now, we'll create a basic user object from the email
      // In a real app, you might want to decode the JWT or make another API call
      const userData: User = {
        id: "1", // This should come from the JWT or API response
        email: email,
        name: email.split("@")[0], // Basic name extraction
      };

      setToken(response.access_token);
      setUser(userData);

      // Save to localStorage and cookies
      localStorage.setItem(TOKEN_KEY, response.access_token);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setCookie(TOKEN_KEY, response.access_token);

      toast.success("ورود موفقیت‌آمیز بود");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("خطا در ورود. لطفاً دوباره تلاش کنید");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthState();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    removeCookie(TOKEN_KEY);
    toast.success("خروج موفقیت‌آمیز بود");
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
