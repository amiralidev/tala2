import { createData } from "@/core/http-service/http-service";

export const createProduct = async (product: any): Promise<any> => {
  return createData<any, any>("/products", product);
};
