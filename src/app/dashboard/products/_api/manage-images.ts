import { createDataWithFormData } from "@/core/http-service/http-service";
import { UploadedImageResponse } from "../_types/images";

export const uploadImages = async ({
  images,
}: {
  images: any;
}): Promise<UploadedImageResponse> => {
  const formData = new FormData();
  images.forEach((file) => {
    formData.append("images", file);
  });

  return createDataWithFormData<FormData, UploadedImageResponse>(
    "/images/upload",
    formData
  );
};
