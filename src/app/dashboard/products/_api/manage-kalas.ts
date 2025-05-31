import { readData } from "@/core/http-service/http-service";

import { useQuery } from "@tanstack/react-query";
import { Kalas } from "../_types/kalas";

export const getKalas = async (): Promise<Kalas[]> => {
  return readData<Kalas[]>("/kalas");
};

export const useKalas = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["kalas"],
    queryFn: () => getKalas(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 6,
  });

  return {
    data: data ?? [],
    isLoading,
    error,
  };
};
