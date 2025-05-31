import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import "./style.css";
import ImagePreview from "./image-previw";
import { uploadImages } from "@/app/dashboard/products/_api/manage-images";
import { UploadedImage } from "@/app/dashboard/products/_types/images";

interface FileUploaderProps {
  onFilesChange: (files: File[]) => void;
  onUploadResponse?: (uploadedImages: UploadedImage[]) => void;
  existingImages?: UploadedImage[];
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesChange,
  onUploadResponse,
  existingImages = [],
}) => {
  const [files, setFiles] = useState<(File & { preview: string })[]>([]);
  const [uploadedImages, setUploadedImages] =
    useState<UploadedImage[]>(existingImages);
  const [isUploading, setIsUploading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: async (acceptedFiles) => {
      const updatedFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setFiles(updatedFiles);
      onFilesChange(updatedFiles); // Notify parent about selected files

      // Upload images and get response with IDs
      if (acceptedFiles.length > 0) {
        setIsUploading(true);
        try {
          const uploadResponse = await uploadImages({
            images: acceptedFiles, // Use original File objects, not modified ones
          });

          // Concatenate new uploaded images with existing ones
          const concatenatedImages = [
            ...uploadedImages,
            ...uploadResponse.uploaded,
          ];
          setUploadedImages(concatenatedImages);

          // Pass the response back as props
          if (onUploadResponse) {
            onUploadResponse(concatenatedImages);
          }
        } catch (error) {
          console.error("Error uploading images:", error);
        } finally {
          setIsUploading(false);
        }
      }
    },
  });

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <section className="uploader-container">
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <p>عکس های محصول را در این قسمت رها کنید</p>
        {isUploading && <p className="text-blue-500">در حال آپلود...</p>}
      </div>
      <aside className="thumbs-container">
        {files.map((file) => (
          <ImagePreview key={file.name} file={file} />
        ))}
      </aside>
      {uploadedImages.length > 0 && (
        <div className="uploaded-images-info">
          <p className="text-green-600">
            تعداد تصاویر آپلود شده: {uploadedImages.length}
          </p>
        </div>
      )}
    </section>
  );
};

export default FileUploader;
