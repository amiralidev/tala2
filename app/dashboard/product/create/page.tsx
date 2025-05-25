"use client";

import { RJSForm } from "@/components/rjsf-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import schemas from "@/lib/schemas.json";
import axios from "axios";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const [files, setFiles] = useState<File[]>([]);
  const [sku, setSku] = useState("AA000001");
  const [bucket, setBucket] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
  const [bucketOptions, setBucketOptions] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState("pre");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        const res = await axios.get("/api/bucket");
        setBucketOptions(res.data.buckets.map((bucket) => bucket.name));
      } catch (error) {
        console.error("Error fetching buckets:", error);
      }
    };
    fetchBuckets();
  }, []);

  const incrementSku = () => {
    const prefix = sku.slice(0, -6);
    const number = sku.slice(-6);

    const incremented = (parseInt(number, 10) + 1).toString().padStart(6, "0");
    setSku(prefix + incremented);
  };

  const onSubmit = async ({ formData }: { formData: any }, e: any) => {
    console.log("Data submitted: ", sku, formData);
    try {
      const title = `${schemas[selectedSchema]["title"].slice(
        0,
        -5
      )} 18 عیار زنانه مدوپد مدل ${formData["product[model]"]} کد ${sku}`;

      await axios.post("/api/product", {
        bucket,
        data: { sku, ...formData, "product[title_fa]": title },
      });

      alert("موفق: " + title);
      setFiles([]);
      setPreviewUrl(null);
      setUploadStatus("pre");
      incrementSku();
    } catch (error) {
      setErrorMessage("Error submitting form");
      console.error(error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);

    // Show preview of the first image file if available
    if (
      selectedFiles.length > 0 &&
      selectedFiles[0].type.startsWith("image/")
    ) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string); // Data URL
      };
      reader.readAsDataURL(selectedFiles[0]);
    } else {
      setPreviewUrl(null); // Clear preview if no image
    }
  };

  const handleSkuChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSku(event.target.value);
  };

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    setUploadStatus("pending");
    setErrorMessage("");

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("folder", sku);

    try {
      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } catch (error) {
      setErrorMessage("Error uploading files");
      setUploadStatus("error");
      console.error(error);
    } finally {
      setUploadStatus("done");
    }
  };

  return (
    <div>
      <div className='max-w-lg p-1'>
        {/* First part - Select and SKU */}
        <form onSubmit={handleUpload}>
          <div className='mb-4'>
            <Label htmlFor='bucket'>مجموعه*</Label>
            <Select onValueChange={setBucket} required>
              <SelectTrigger className='mt-2'>
                <SelectValue placeholder='انتخاب کنید' />
              </SelectTrigger>
              <SelectContent>
                {bucketOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='mb-4'>
            <Label htmlFor='category'>دسته بندی*</Label>
            <Select onValueChange={setSelectedSchema}>
              <SelectTrigger>
                <SelectValue placeholder='Select Schema' />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(schemas).map(([key, schema]) => (
                  <SelectItem key={key} value={key}>
                    {schema.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='mb-4'>
            <Label htmlFor='sku'>شناسه*</Label>
            <Input
              id='sku'
              type='text'
              value={sku}
              onChange={handleSkuChange}
              className='mt-2'
              required
            />
          </div>

          {/* Image Upload part */}
          <div className='max-w-lg mt-6'>
            <div className='mb-4'>
              <Label htmlFor='fileInput'>تصاویر را انتخاب کنید</Label>
              <Input
                id='fileInput'
                type='file'
                multiple
                onChange={handleFileChange}
                className='mt-2'
              />
            </div>

            {previewUrl && (
              <div className='mb-4'>
                <Label>تصویر اصلی:</Label>
                <img
                  src={previewUrl}
                  alt='تصویر اصلی'
                  className='mt-2 max-h-48 rounded border'
                />
              </div>
            )}

            {errorMessage && <p className='text-red-500'>{errorMessage}</p>}
          </div>

          <Button
            type='submit'
            className='mt-2'
            disabled={uploadStatus == "pending"}
          >
            {uploadStatus == "pre"
              ? "آپلود تصاویر"
              : uploadStatus == "pending"
              ? "درحال آپلود"
              : uploadStatus == "done"
              ? "آپلود شده"
              : "خطا"}
          </Button>
        </form>
      </div>

      {/* Second part - Render schema form */}
      {selectedSchema && (
        <RJSForm schema={schemas[selectedSchema]} onSubmit={onSubmit} />
      )}
    </div>
  );
}
