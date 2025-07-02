import { API_URL } from "@/configs/global";
import { ApiError } from "@/types/http-errors.interface";
import axios, {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
} from "axios";
import { errorHandler, networkErrorStrategy } from "./http-error-strategies";

const httpService = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include Bearer token
httpService.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("talasys_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function to logout user
const logoutUser = () => {
  // Remove from localStorage
  localStorage.removeItem("talasys_access_token");
  localStorage.removeItem("talasys_user");

  // Remove cookie
  document.cookie =
    "talasys_access_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";

  // Redirect to login page
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

httpService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error?.response) {
      const statusCode = error?.response?.status;

      // Handle 401 Unauthorized - automatically logout user
      if (statusCode === 403) {
        logoutUser();
        return Promise.reject(error);
      }

      if (statusCode >= 400) {
        const errorData: ApiError = error.response?.data;

        errorHandler[statusCode](errorData);
      }
    } else {
      networkErrorStrategy();
    }

    return Promise.reject(error);
  }
);

async function apiBase<T>(
  url: string,
  options?: AxiosRequestConfig
): Promise<T> {
  const response: AxiosResponse = await httpService(url, options);
  return response.data as T;
}

async function readData<T>(
  url: string,
  headers?: AxiosRequestHeaders
): Promise<T> {
  const options: AxiosRequestConfig = {
    headers: headers,
    method: "GET",
  };
  return await apiBase<T>(url, options);
}

async function createData<TModel, TResult>(
  url: string,
  data: TModel,
  headers?: AxiosRequestHeaders
): Promise<TResult> {
  const options: AxiosRequestConfig = {
    method: "POST",
    headers: headers,
    data: JSON.stringify(data),
  };

  return await apiBase<TResult>(url, options);
}

async function createDataWithFormData<TModel, TResult>(
  url: string,
  data: TModel,
  headers?: AxiosRequestHeaders
): Promise<TResult> {
  const options: AxiosRequestConfig = {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "multipart/form-data",
    },
    data: data,
  };
  return await apiBase<TResult>(url, options);
}

async function updateData<TModel, TResult>(
  url: string,
  data: TModel,
  headers?: AxiosRequestHeaders
): Promise<TResult> {
  const options: AxiosRequestConfig = {
    method: "PUT",
    headers: headers,
    data: JSON.stringify(data),
  };

  return await apiBase<TResult>(url, options);
}

async function deleteData(
  url: string,
  headers?: AxiosRequestHeaders
): Promise<void> {
  const options: AxiosRequestConfig = {
    method: "DELETE",
    headers: headers,
  };

  return await apiBase(url, options);
}

export { createData, createDataWithFormData, deleteData, readData, updateData };
