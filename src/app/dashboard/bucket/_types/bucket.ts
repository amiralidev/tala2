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
