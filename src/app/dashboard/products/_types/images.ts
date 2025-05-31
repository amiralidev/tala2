export type ImageUpload = {
  images: File[];
};

export interface UploadedImageResponse {
  uploaded: UploadedImage[];
}

export interface UploadedImage {
  id: string;
  key: string;
  url: string;
}
