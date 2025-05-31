import { createData, readData } from "@/core/http-service/http-service";

import { useQuery } from "@tanstack/react-query";
import { Kalas } from "../_types/kalas";

export const getBuckets = async (): Promise<Kalas[]> => {
  return readData<Kalas[]>("/kalas");
};

export const useKalas = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["kalas"],
    queryFn: () => getBuckets(),
  });

  return {
    data: data ?? [],
    isLoading,
    error,
  };
};
