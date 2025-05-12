"use client"

import { RJSForm } from '@/components/rjsf-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import schemas from "@/lib/schemas.json";
import axios from "axios";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const category_code = {
11314: "B",
9388: "D",
9390: "Z",
9391: "E", // gooshvare
9392: "S", // service
9393: "G", // gardanband
9394: "A", // aviz
}

export default function Page() {
  const [files, setFiles] = useState<File[]>([]);
  const [sku, setSku] = useState("AA-D-000001");
  const [bucket, setBucket] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
  const [bucketOptions, setBucketOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
  const fetchBuckets = async () => {
    try {
      const res = await axios.get('/api/bucket');
      setBucketOptions(res.data.buckets.map(bucket=>bucket.name));
    } catch (error) {
      console.error('Error fetching buckets:', error);
    }
  };
  fetchBuckets();
  }, []);

    const incrementSku = () => {
        const prefix = sku.slice(0, -6)
        const number = sku.slice(-6)

        const incremented = (parseInt(number, 10) + 1).toString().padStart(6, '0')
        setSku(prefix + incremented)

    }

    const categorySku = (newCat) => {
        const cat_code = category_code[newCat];
        const prefix = sku.slice(0, 2)
        const postfix = sku.slice(-6)
        setSku(prefix + cat_code + postfix)
    }

  const onSubmit = async ({ formData }: { formData: any }, e: any) => {
    console.log('Data submitted: ', sku, formData);
    try {
      await axios.post("/api/product", { bucket, data: {sku, ...formData} });
      alert('Form submitted successfully!');
      incrementSku()
    } catch (error) {
      setErrorMessage('Error submitting form');
      console.error(error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(selectedFiles);

    // Show preview of the first image file if available
    if (selectedFiles.length > 0 && selectedFiles[0].type.startsWith('image/')) {
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
    setIsSubmitting(true);
    setErrorMessage('');

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    formData.append('folder', sku);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Files uploaded successfully!');
    } catch (error) {
      setErrorMessage('Error uploading files');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="max-w-lg p-1">
        {/* First part - Select and SKU */}
        <form onSubmit={handleUpload}>
         
          <div className="mb-4">
            <Label htmlFor="bucket">مجموعه*</Label>
            <Select onValueChange={setBucket} required>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="انتخاب کنید" />
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

          <div className="mb-4">
            <Label htmlFor="category">دسته بندی*</Label>
            <Select onValueChange={(newValue)=> {
                setSelectedSchema(newValue);
                categorySku(newValue);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select Schema" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(schemas).map(([key, schema]) => (
                  <SelectItem key={key} value={key}>
                    {schema.title} {category_code[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <Label htmlFor="sku">شناسه*</Label>
            <Input
              id="sku"
              type="text"
              value={sku}
              onChange={handleSkuChange}
              className="mt-2"
              required
            />
          </div>

          {/* Image Upload part */}
            <div className="max-w-lg mt-6">
              <div className="mb-4">
                <Label htmlFor="fileInput">تصاویر را انتخاب کنید</Label>
                <Input
                  id="fileInput"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="mt-2"
                />
              </div>

              {previewUrl && (
                <div className="mb-4">
                  <Label>تصویر اصلی:</Label>
                  <img
                    src={previewUrl}
                    alt="تصویر اصلی"
                    className="mt-2 max-h-48 rounded border"
                  />
                </div>
              )}

              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            </div>


          <Button
            type="submit"
            className="mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'در حال آپلود' : 'آپلود تصاویر'}
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
