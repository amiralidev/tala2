import { createData, readData } from "@/core/http-service/http-service";
import { useQuery } from "@tanstack/react-query";
import {
  BucketCreate,
  BucketCreateResponse,
  BucketList,
  BucketListItemsResponse,
} from "../_types/bucket";

export const getBuckets = async (): Promise<BucketList[]> => {
  return readData<BucketList[]>("/buckets");
};

export const getBucket = async ({
  bucketId,
}: {
  bucketId: string;
}): Promise<BucketListItemsResponse[]> => {
  return readData<BucketListItemsResponse[]>(`/products/bucket/${bucketId}`);
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

export const useBucket = ({ bucketId }: { bucketId: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["bucket"],
    queryFn: () => getBucket({ bucketId: bucketId }),
  });

  return {
    data: data ?? [],
    isLoading,
    error,
  };
};
