export interface BucketList {
  _id: string;
  name: string;
  code: string;
}

export type BucketCreate = {
  name: string;
  code: string;
};

export interface BucketCreateResponse {
  name: string;
  code: string;
  _id: string;
  __v: number;
}

export interface BucketListItems {
  _id: string;
  name: string;
  code: string;
}

export interface BucketListItemsResponse {
  _id: string;
  sku: string;
  kala: string;
  bucket: string;
  variants: Variant[];
  images: string[];
  shops: Shop[];
  pricing: Pricing;
  createdAt: string;
  updatedAt: string;
  digikalaData: Record<string, string>;
}

interface Variant {
  weight: number;
  stock: number;
  _id: string;
}

interface Shop {
  shop: string;
}

interface Pricing {
  wage: number;
  profit: number;
}
