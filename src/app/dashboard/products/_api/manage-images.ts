import { createData, readData } from "@/core/http-service/http-service";
import { ImageUpload, UploadedImageResponse } from "../_types/images";

export const uploadImages = async (
  images: ImageUpload
): Promise<UploadedImageResponse> => {
  return createData<ImageUpload, UploadedImageResponse>(
    "/images/upload",
    images
  );
};
