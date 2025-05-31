"use client";

import { RJSForm } from "@/components/rjsf-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect, use } from "react";
import schemas from "@/lib/schemas.json";
import axios from "axios";

import { CustomSelect } from "@/components/custom-select";
import { CustomInput } from "@/components/custom-input";
import FileUploader from "@/components/file-uploader";
import { useKalas } from "../_api/manage-kalas";

export default function Page({
  product,
  searchParams,
}: {
  product?: any;
  searchParams?: Promise<{ bucketName?: string; bucketCode?: string }>;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [sku, setSku] = useState(product?.sku || "000001");
  const [bucket, setBucket] = useState<string | null>(product?.bucket || "");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedSchema, setSelectedSchema] = useState<string>("");
  const [bucketOptions, setBucketOptions] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState("pre");
  // const [errorMe  ssage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    files: [],
  });
  const { data: kalasData, isLoading, error: kalasError } = useKalas();

  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const bucketName = resolvedSearchParams?.bucketName || "";
  const bucketCode = resolvedSearchParams?.bucketCode || "";

  useEffect(() => {
    // setSelectedSchema("11314");
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
        -6
      )} 18 عیار زنانه مدوپد مدل ${formData["product[model]"]} کد ${sku}`;

      await axios.post("/api/product", {
        bucket,
        data: {
          sku,
          data: { ...formData },
          category: selectedSchema,
          title: title,
        },
      });

      alert("موفق: " + title);
      setFiles([]);
      setPreviewUrl(null);
      setUploadStatus("pre");
      incrementSku();
    } catch (error) {
      // setErrorMessage("Error submitting form");
      console.error(error);
    }
  };

  const handleFilesChange = (files) => {
    setFormData((prev) => ({ ...prev, files }));
  };

  const handleSkuChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSku(event.target.value);
  };

  // const handlload = async (event: React.FormEvent) => {
  //   event.pretDefault();
  //   setUploadtus("pending");
  //   setErrorMage("");

  //   const forta = new FormData();
  //   files.forh((file) => {
  //     formDatppend("files", file);
  //   });

  //formData.end("folder", sku);

  //   try {
  //  const ronse = await axios.post("/api/upload", formData, {
  //       heade {
  //         "Cont-Type": "multi
  // part/form-data",
  //     ,
  //      catch (er) {
  //    sssage("Er uploading files");
  //     setUplos("error");
  //      console.error(error);
  //} finally {
  //     setUplotatus("done");
  // }
  // };

  if (isLoading) return <div>در حال بارگذاری...</div>;

  const handleInputChange = (e, fieldName) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: e.target.value,
    }));
  };

  const handleSelectChange = (value, fieldName) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  return (
    <div>
      <div className="w-full p-1">
        <div className="border-b pb-5 mb-5">
          <b className="text-xl">
            ایجاد محصول جدید | نام مجموعه ({bucketName}) | کد ({bucketCode})
          </b>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3 space-y-4">
            <CustomInput
              label="شناسه"
              id="sku"
              value={bucketCode + sku}
              onChange={handleSkuChange}
              className="w-48"
            />

            <CustomSelect
              label="کالا"
              id="product"
              placeholder="انتخاب کنید"
              options={kalasData}
              value={selectedSchema}
              onValueChange={setSelectedSchema}
            />

            {true && (
              <>
                {kalasData.map((item) => {
                  // console.log(schemaItem);
                  // schemaItem = JSON.parse(schemaItem);

                  // const isRequired =
                  //   kalasData[0]["data"]["schema"]["required"].includes(
                  //     fieldItem
                  //   );

                  // console.log(schemaItem["properties"]);

                  // Object.values(
                  //   item["data"]["schema"]["properties"]
                  // ).map(item) => {
                  //   console.log(item);
                  // });

                  // if (fieldSchema.oneOf) {
                  //   // This is a select input (dropdown)
                  //   const options = fieldSchema.oneOf.map((option) => ({
                  //     const: option.const,
                  //     title: option.title,
                  //   }));
                  //   return (
                  //     <CustomSelect
                  //       key={fieldName}
                  //       label={fieldSchema.title}
                  //       id={fieldName}
                  //       options={options}
                  //       value={formData[fieldName] || ""}
                  //       onValueChange={(value) =>
                  //         handleSelectChange(value, fieldName)
                  //       }
                  //       required={isRequired}
                  //       className="w-full"
                  //     />
                  //   );
                  // } else if (
                  //   fieldSchema.type === "array" &&
                  //   fieldSchema.items &&
                  //   fieldSchema.items.anyOf
                  // ) {
                  //   // This is a multi-select input (if you support it)
                  //   // For simplicity, I'm rendering it as a single select for now,
                  //   // but you might need a different component for true multi-select.
                  //   const options = fieldSchema.items.anyOf.map((option) => ({
                  //     const: option.const,
                  //     title: option.title,
                  //   }));
                  //   return (
                  //     <CustomSelect
                  //       key={fieldName}
                  //       label={fieldSchema.title}
                  //       id={fieldName}
                  //       options={options}
                  //       value={formData[fieldName] || ""}
                  //       onValueChange={(value) =>
                  //         handleSelectChange(value, fieldName)
                  //       }
                  //       required={isRequired}
                  //       className="w-full"
                  //       // Set multiple to true if your CustomSelect supports it
                  //       // multiple={true}
                  //     />
                  //   );
                  // } else if (
                  //   fieldSchema.type === "string" ||
                  //   fieldSchema.type === "number"
                  // ) {
                  //   // This is a text or number input
                  //   return (
                  //     <CustomInput
                  //       key={fieldName}
                  //       label={fieldSchema.title}
                  //       id={fieldName}
                  //       value={formData[fieldName] || ""}
                  //       onChange={(e) => handleInputChange(e, fieldName)}
                  //       className="w-full"
                  //       required={isRequired}
                  //       // type={fieldSchema.type} // Pass type to CustomInput for number fields
                  //     />
                  //   );
                  // }
                  return null; // Don't render if type is not supported
                })}
              </>
            )}

            {/* Second part - Render schema form */}
            {true && (
              <RJSForm
                schema={schemas["11314"]}
                onSubmit={onSubmit}
                formData={product?.data}
              />
            )}
          </div>
          <div className="col-span-1">
            <FileUploader onFilesChange={handleFilesChange} />
            <div className="border-t pt-4">
              <Button
                type="submit"
                className="w-full h-12 bg-blue-500 text-white cursor-pointer"
                disabled={uploadStatus == "pending"}
              >
                {uploadStatus == "pre"
                  ? "ثبت محصول"
                  : uploadStatus == "pending"
                  ? "درحال آپلود"
                  : uploadStatus == "done"
                  ? "آپلود شده"
                  : "خطا"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
