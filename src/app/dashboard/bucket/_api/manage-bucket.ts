import { createData, readData } from "@/core/http-service/http-service";
import {
  BucketCreate,
  BucketCreateResponse,
  BucketList,
} from "../_types/bucket";
import { useQuery } from "@tanstack/react-query";

export const getBuckets = async (): Promise<BucketList[]> => {
  return readData<BucketList[]>("/buckets");
};

export const createBucket = async (
  bucket: BucketCreate
): Promise<BucketCreateResponse> => {
  return createData<BucketCreate, BucketCreateResponse>("/buckets", bucket);
};

export const useBuckets = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["buckets"],
    queryFn: () => getBuckets(),
  });

  return {
    data: data ?? [],
    isLoading,
    error,
  };
};
