export interface BucketList {
  _id: string;
  name: string;
  code: string;
  brand: string;
}

export type BucketCreate = {
  brand: string;
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

export interface BucketProduct {
  _id: string;
  sku: string;
  kala: string;
  bucket: string;
  variants: Variant[];
  images: Image[];
  shops: Shop[];
  pricing: Pricing;
  createdAt: string;
  updatedAt: string;
  digikalaData?: Record<string, string>;
}

interface Image {
  _id: string;
  url: string;
}

export interface BucketListItemsResponse {
  bucket: BucketList;
  products: BucketProduct[];
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
