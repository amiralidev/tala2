export type CreateTask = {
  type: string;
  shop: string;
  bucket: string;
  status: string;
  extraFields?: {
    category?: string;
  };
};
