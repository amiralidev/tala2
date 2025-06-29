import { createData, readData } from "@/core/http-service/http-service";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { MarketplaceList } from "../_types/marketplace";
import { ShopList } from "../_types/shop";
import { CreateTask } from "../_types/task";

export const getShops = async (): Promise<ShopList[]> => {
  return readData<ShopList[]>("/shops");
};

export const getBucketShops = async (bucketId: string): Promise<any[]> => {
  return readData<any[]>(`/buckets/${bucketId}/shops`);
};

export const useBucketShops = (
  bucketId: string,
  options?: { enabled?: boolean }
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["bucketShops", bucketId],
    queryFn: () => getBucketShops(bucketId),
    enabled: options?.enabled ?? true,
  });

  return {
    data: data ?? [],
    isLoading,
    error,
  };
};

export const createTask = async (task: CreateTask): Promise<any> => {
  return createData<CreateTask, any>("/tasks", task);
};

export const getMarketplaces = async (): Promise<MarketplaceList[]> => {
  return readData<MarketplaceList[]>("/marketplaces");
};

export const useShops = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["shops"],
    queryFn: () => getShops(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 6,
  });

  return {
    data: data ?? [],
    isLoading,
    error,
  };
};

export const useMarketplaces = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["marketplaces"],
    queryFn: () => getMarketplaces(),
  });

  return {
    data: data ?? [],
    isLoading,
    error,
  };
};

// Add a custom hook for creating tasks with loading and error states
export const useCreateTask = () => {
  //   const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate and refetch related queries
      toast.success("تسک مورد نظر با موفقیت ایجاد شد.");
      //   queryClient.invalidateQueries({ queryKey: ["shops"] });
      // Add other queries that might be affected
    },
    onError: (error) => {
      // Handle error globally if needed
      toast.error("مشکلی در ایجاد تسک مورد نظر رخ داده است.");
      console.error("Failed to create task:", error);
    },
  });
};
