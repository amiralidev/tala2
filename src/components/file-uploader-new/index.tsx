"use client";

import { uploadImages } from "@/app/dashboard/products/_api/manage-images";
import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";
import { Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface FileUploaderNewProps {
  onImageIdsChange?: (imageIds: string[]) => void;
}

export function FileUploaderNew({ onImageIdsChange }: FileUploaderNewProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploadedImageIds, setUploadedImageIds] = React.useState<string[]>([]);

  // Call parent callback when uploadedImageIds changes
  React.useEffect(() => {
    if (uploadedImageIds.length > 0) {
      onImageIdsChange?.(uploadedImageIds);
    }
  }, [uploadedImageIds, onImageIdsChange]);

  const onUpload = React.useCallback(
    async (
      files: File[],
      {
        onProgress,
        onSuccess,
        onError,
      }: {
        onProgress: (file: File, progress: number) => void;
        onSuccess: (file: File) => void;
        onError: (file: File, error: Error) => void;
      }
    ) => {
      try {
        // Filter only image files
        const imageFiles = files.filter((file) =>
          file.type.startsWith("image/")
        );

        if (imageFiles.length === 0) {
          files.forEach((file) => {
            onError(file, new Error("Only image files are allowed"));
          });
          return;
        }

        // Start upload progress for all files
        imageFiles.forEach((file) => {
          onProgress(file, 0);
        });

        // Simulate progress updates during upload
        const progressIntervals = imageFiles.map((file) => {
          let currentProgress = 0;
          const interval = setInterval(() => {
            if (currentProgress < 90) {
              currentProgress += Math.random() * 15 + 5; // Random increment between 5-20%
              onProgress(file, Math.min(currentProgress, 90));
            }
          }, 200); // Update every 200ms

          return { file, interval };
        });

        // Use the uploadImages API
        const uploadResponse = await uploadImages({
          images: imageFiles,
        });

        // Clear progress intervals
        progressIntervals.forEach(({ interval }) => clearInterval(interval));

        // Extract IDs from upload response
        const newImageIds = uploadResponse.uploaded.map(
          (item: { id: string }) => item.id
        );

        // Update the accumulated image IDs
        setUploadedImageIds((prevIds) => [...prevIds, ...newImageIds]);

        // Update progress to 100% and mark as success for all uploaded files
        imageFiles.forEach((file) => {
          onProgress(file, 100);
          onSuccess(file);
        });
      } catch (error) {
        // Handle errors for all files
        files.forEach((file) => {
          onError(
            file,
            error instanceof Error ? error : new Error("Upload failed")
          );
        });

        console.error("Upload error:", error);
      }
    },
    []
  );

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${
        file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name
      }" has been rejected`,
    });
  }, []);

  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      maxFiles={10}
      maxSize={5 * 1024 * 1024}
      className="w-full max-w-md"
      onUpload={onUpload}
      onFileReject={onFileReject}
      multiple
    >
      <FileUploadDropzone>
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">
            فایل های محصول را در این قسمت رها کنید
          </p>
          <p className="text-muted-foreground text-xs">
            یا برای انتخاب فایل ها کلیک کنید (حداکثر 10 فایل, حداکثر 5MB برای هر
            فایل)
          </p>
        </div>
        <FileUploadTrigger asChild>
          <Button variant="outline" size="sm" className="mt-2 w-fit">
            انتخاب فایل ها
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>
      <FileUploadList orientation="vertical">
        {files.map((file, index) => (
          <FileUploadItem key={index} value={file} className="p-0 border-none">
            <div className="relative">
              <FileUploadItemPreview
                className={index == 0 ? "size-72" : "size-20 border-none"}
              >
                <FileUploadItemProgress variant="fill" />
              </FileUploadItemPreview>
              <FileUploadItemDelete asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="-top-1 -right-1 absolute size-5 rounded-full"
                >
                  <X className="size-3" />
                </Button>
              </FileUploadItemDelete>
            </div>
            <div className="mt-2">
              <FileUploadItemProgress variant="linear" className="h-2" />
            </div>
            <FileUploadItemMetadata className="sr-only" />
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUpload>
  );
}
