"use client"

import { RJSForm } from '@/components/rjsf-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RJSFSchema } from '@rjsf/utils';
import { useState } from 'react';
import schemas from "./schemas.json"
import axios from "axios"

const schema: RJSFSchema = {
  title: 'ایجاد محصول',
  type: "object",
  properties: {
    "hello": {
        title: "عنوان",
        type: "string",
    },
    "zello": {
        title: "رنگ",
        type: "string",
    },
    "haello": {
              title: "عنوان",
              type: "string",
    },
    "zaello": {
      title: "رنگ",
      type: "string",
      oneOf: [{
          const: "salam",
          title: "hello",
        }, {
          const: "khodafez",
          title: "bye",
        }
      ]
    }
  }
};

export default function Page() {

    const [files, setFiles] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const onSubmit = ({ formData }:{formData: RJSFSchema}, e) => console.log('Data submitted: ', formData);

    const handleFileChange = (event) => {
      const selectedFiles = Array.from(event.target.files);
      setFiles(selectedFiles);
  
      // Show preview of the first image file if available
      if (selectedFiles.length > 0 && selectedFiles[0].type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result); // Data URL
        };
        reader.readAsDataURL(selectedFiles[0]);
      } else {
        setPreviewUrl(null); // Clear preview if no image
      }
    };

    const handleSubmit = async (event) => {
      event.preventDefault();
      setIsSubmitting(true);
      setErrorMessage('');

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      
      formData.append('folder', 'yes')

      try {
        console.log("hey",  files)
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
          <div className="max-w-lg p-4">
            <h1 className="text-2xl font-semibold mb-4">آپلود تصاویر</h1>
            <form onSubmit={handleSubmit}>
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

              <Button
                type="submit"
                className="mt-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Uploading...' : 'Upload Files'}
              </Button>
            </form>
          </div>
            <RJSForm schema={schemas[2]} onSubmit={onSubmit}/>
        </div>
    )
  }
  