"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Fragment,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"; // Added useCallback

import { FileUploaderNew } from "@/components/file-uploader-new";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MultipleSelector from "@/components/ui/multiple-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseRial } from "@/utils/rial-formatter";
import { convertBrackets, reverseConvert } from "@/utils/zod-schema-converter";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod"; // Using 'zod' directly, v4 is usually implied by project setup
import { useKalas } from "../_api/manage-kalas";
import { createProduct } from "../_api/manage-product";

// Variant schema
const variantSchema = z.object({
  weight: z
    .string()
    .min(1, { message: "وزن الزامی است" })
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num > 0;
      },
      { message: "وزن باید عدد مثبت باشد" }
    ),
  stock: z
    .preprocess((val) => {
      if (typeof val === "string") {
        const num = Number(val);
        return isNaN(num) ? 0 : num;
      }
      return val;
    }, z.number().min(1, { message: "موجودی الزامی است" }))
    .refine(
      (val) => {
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      { message: "موجودی باید عدد مثبت باشد" }
    ),
  extras_price: z.string().optional(),
  extras_wage: z.string().optional(),
});

const baseSchema = z.object({
  // sku: z.string().min(1, { message: "شناسه الزامی است" }),
  wage: z.string().min(1, { message: "اجرت الزامی است" }),
  profit: z.string().min(1, { message: "سود الزامی است" }),
  variants: z
    .array(variantSchema)
    .min(1, { message: "حداقل یک نوع محصول الزامی است" }),
});

export default function Page({
  product, // Existing product data for editing, if any
  searchParams,
}: {
  product?: any;
  searchParams?: Promise<{
    bucketName?: string;
    bucketCode?: string;
    bucketId?: string;
  }>;
}) {
  const router = useRouter();
  const [selectedSchema, setSelectedSchema] = useState<string>(
    product?.kalaId || "" // Initialize with product's kalaId if editing
  );

  const { data: kalasData = [], isLoading } = useKalas();
  const [productImageIds, setProductImageIds] = useState<string[]>([]);

  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const bucketName = resolvedSearchParams?.bucketName || "";
  const bucketCode = resolvedSearchParams?.bucketCode || "";
  const bucketId = resolvedSearchParams?.bucketId || "";

  // Find selected kala based on selectedSchema (ID)
  const selectedKala = useMemo(
    () => kalasData.find((item) => item._id === selectedSchema),
    [kalasData, selectedSchema]
  );

  // State for the dynamically generated Zod schema parts and default values
  const [dynamicSchemaParts, setDynamicSchemaParts] = useState<
    Record<string, z.ZodTypeAny>
  >({});
  const [formDefaultValues, setFormDefaultValues] = useState<
    Record<string, any>
  >(() => {
    // Initial default values, potentially from `product` prop
    const initialDefaults: Record<string, any> = {
      // sku: product?.sku || "",
      wage: product?.wage || "",
      profit: product?.profit || "",
      variants: product?.variants?.map((variant: any, index: number) => ({
        ...variant,
        id: variant.id || `initial-${index}-${Date.now()}`, // Ensure each variant has an ID
      })) || [
        {
          id: Date.now(),
          weight: "",
          stock: 1,
          extras_price: "0",
          extras_wage: "0",
        },
      ],
    };
    // Don't set dynamic schema defaults here - they'll be set in the useEffect when selectedKala is available
    return initialDefaults;
  });

  // Load saved data from localStorage on component mount
  useEffect(() => {
    if (!product) {
      // Only load if editing mode is not active
      try {
        const savedData = localStorage.getItem("product_form_data");
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          const { selectedSchema: savedSchema, formData: savedFormData } =
            parsedData;

          // Restore selected schema
          if (savedSchema) {
            setSelectedSchema(savedSchema);
          }

          // Restore product images
          // if (savedImages) {
          //   setProductImageIds(savedImages);
          // }

          // Store saved form data to be applied after schema is ready
          if (savedFormData) {
            console.log("🔄 Restoring form data:", savedFormData);
            // We'll apply this after the dynamic schema is set up
            setFormDefaultValues((prev) => ({
              ...prev,
              ...savedFormData,
            }));
          }
        }
      } catch (error) {
        console.error("Error loading saved form data:", error);
      }
    }
  }, [product]);

  // Save form data to localStorage whenever form values change
  const saveFormData = useCallback(
    (formData: Record<string, any>) => {
      if (!product) {
        // Only save if not in editing mode
        try {
          const dataToSave = {
            selectedSchema,
            productImageIds,
            formData,
            timestamp: Date.now(),
          };
          console.log("💾 Saving form data:", dataToSave);
          localStorage.setItem("product_form_data", JSON.stringify(dataToSave));
        } catch (error) {
          console.error("Error saving form data:", error);
        }
      }
    },
    [selectedSchema, productImageIds, product]
  );

  // Combine base schema with dynamic parts
  const currentFormSchema = useMemo(() => {
    return baseSchema.extend(dynamicSchemaParts);
  }, [dynamicSchemaParts]);

  // Effect to update dynamic schema parts and default values when selectedKala changes
  useEffect(() => {
    const newDynamicSchema: Record<string, z.ZodTypeAny> = {};
    const newDefaults: Record<string, any> = {
      // sku: product?.sku || formDefaultValues.sku || "", // Preserve SKU if editing or already set
      wage: product?.wage || formDefaultValues.wage || "", // Preserve wage if editing or already set
      profit: product?.profit || formDefaultValues.profit || "", // Preserve profit if editing or already set
      variants:
        product?.variants ||
        formDefaultValues.variants ||
        [
          {
            id: Date.now(), // Add unique ID
            weight: "",
            stock: 1,
            extras_price: "0",
            extras_wage: "0",
          },
        ].map((variant: any, index: number) => ({
          ...variant,
          id: variant.id || `default-${index}-${Date.now()}`, // Ensure ID exists
        })),
    };

    if (selectedKala?.data?.schema?.properties) {
      const properties = selectedKala.data.schema.properties;
      const requiredFields = selectedKala.data.schema.required || [];
      const defaultValues = selectedKala.data.defaultValues;

      Object.entries(properties).forEach(([key, propDef]: [string, any]) => {
        // if (key === "sku") return; // SKU is in baseSchema
        if (key === "variants") return; // Variants is in baseSchema
        if (key === "wage") return; // wage is in baseSchema
        if (key === "profit") return; // profit is in baseSchema
        // const fieldTitle = propDef.title || key;
        const fieldTitle = propDef.title || key;
        const isRequired = requiredFields.includes(key);
        let fieldSchema: z.ZodTypeAny;
        if (propDef.type === "array" && propDef.items.anyOf) {
          const s = z.array(
            z.string({
              invalid_type_error: `${fieldTitle} نامعتبر است.`,
            })
          );
          if (isRequired) {
            fieldSchema = s.min(1, { message: `${fieldTitle} الزامی است` });
          } else {
            fieldSchema = z.preprocess(
              (v) => (v === "" ? undefined : v),
              s.optional()
            );
          }
        } else {
          const s = z.string({
            invalid_type_error: `${fieldTitle} نامعتبر است.`,
          });
          if (isRequired) {
            fieldSchema = s.min(1, { message: `${fieldTitle} الزامی است` });
          } else {
            fieldSchema = z.preprocess(
              (v) => (v === "" ? undefined : v),
              s.optional()
            );
          }
        }

        newDynamicSchema[convertBrackets(key)] = fieldSchema;
        // Set default value: product's value > schema default > type default
        const convertedKey = convertBrackets(key);
        const defaultValue =
          product?.[convertedKey] !== undefined
            ? product[convertedKey]
            : defaultValues?.[convertedKey] !== undefined
            ? defaultValues[convertedKey]
            : defaultValues?.[key] !== undefined
            ? defaultValues[key]
            : "";

        newDefaults[convertedKey] = defaultValue;
      });
    }
    setDynamicSchemaParts(newDynamicSchema);

    setFormDefaultValues(newDefaults);
  }, [selectedKala, product]); // Rerun if selectedKala or product changes

  // Initialize react-hook-form
  const form = useForm<Record<string, any>>({
    // Use Record<string, any> for dynamic values
    resolver: zodResolver(currentFormSchema), // Pass the current combined schema
    defaultValues: formDefaultValues, // Initial default values
    mode: "onBlur", // Changed from onChange to onBlur to reduce validation triggers
  });

  // Effect to apply default values when schema changes (for new selections)
  useEffect(() => {
    if (
      selectedKala &&
      !product &&
      Object.keys(dynamicSchemaParts).length > 0
    ) {
      // Check if this is a new schema selection (not from saved data)
      const savedData = localStorage.getItem("product_form_data");
      const isNewSelection =
        !savedData || JSON.parse(savedData)?.selectedSchema !== selectedSchema;

      if (isNewSelection) {
        // Apply default values to form fields
        Object.entries(formDefaultValues).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            form.setValue(key, value, { shouldValidate: false });
          }
        });
      }
    }
  }, [
    selectedKala,
    dynamicSchemaParts,
    product,
    formDefaultValues,
    form,
    selectedSchema,
  ]);

  // Reset form and clear localStorage
  // const resetForm = useCallback(() => {
  //   try {
  //     localStorage.removeItem("product_form_data");
  //   } catch (error) {
  //     console.error("Error clearing saved form data:", error);
  //   }

  //   // Reset form to initial state
  //   setSelectedSchema("");
  //   setProductImageIds([]);

  //   const initialDefaults = {
  //     wage: "",
  //     profit: "",
  //     variants: [
  //       {
  //         id: Date.now(),
  //         weight: "",
  //         stock: 1,
  //         extras_price: "0",
  //         extras_wage: "0",
  //       },
  //     ],
  //   };

  //   setFormDefaultValues(initialDefaults);
  //   form.reset(initialDefaults);
  // }, [form]);

  // Effect to reset the form when defaultValues or the schema itself changes.
  // This is crucial for react-hook-form to pick up new defaults and structure.
  useEffect(() => {
    // Only reset if we have a proper schema and default values
    // But don't reset if we're in the middle of restoring saved data
    if (Object.keys(dynamicSchemaParts).length > 0 && selectedKala) {
      // Check if we have saved data that we should preserve
      const savedData = localStorage.getItem("product_form_data");
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // If we have saved data for the current schema, don't reset
          if (
            parsedData.selectedSchema === selectedSchema &&
            parsedData.formData
          ) {
            console.log("🔄 Skipping form reset - preserving saved data");
            return;
          }
        } catch (error) {
          console.error("Error checking saved data:", error);
        }
      }

      console.log("🔄 Resetting form with new defaults:", formDefaultValues);
      form.reset(formDefaultValues);
    }
  }, [
    formDefaultValues,
    currentFormSchema,
    form.reset,
    dynamicSchemaParts,
    selectedKala,
    selectedSchema,
  ]);

  // Effect to restore saved form data after schema is ready
  useEffect(() => {
    if (
      !product &&
      selectedKala &&
      Object.keys(dynamicSchemaParts).length > 0
    ) {
      try {
        const savedData = localStorage.getItem("product_form_data");
        console.log("🔍 Checking for saved data:", savedData);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          console.log("📦 Parsed saved data:", parsedData);

          // Check if the saved schema matches the current schema
          if (
            parsedData.selectedSchema === selectedSchema &&
            parsedData.formData
          ) {
            console.log("✅ Restoring form data:", parsedData.formData);

            // Merge saved data with current defaults to ensure all fields are present
            const mergedData = {
              ...formDefaultValues,
              ...parsedData.formData,
            };

            // Apply the merged data to the form
            form.reset(mergedData);

            // Also set values individually to ensure select fields are properly updated
            Object.entries(parsedData.formData).forEach(([key, value]) => {
              if (value !== undefined && value !== null && value !== "") {
                form.setValue(key, value, { shouldValidate: false });
              } else if (value === undefined || value === null) {
                // Ensure undefined/null values become empty strings
                form.setValue(key, "", { shouldValidate: false });
              }
            });

            console.log("✅ Form values restored successfully");
          } else {
            console.log("❌ Not restoring - conditions not met:", {
              hasFormData: !!parsedData.formData,
              savedSchema: parsedData.selectedSchema,
              currentSchema: selectedSchema,
            });
          }
        }
      } catch (error) {
        console.error("Error restoring saved form data:", error);
      }
    }
  }, [
    selectedKala,
    dynamicSchemaParts,
    product,
    selectedSchema,
    form,
    formDefaultValues,
  ]);

  // Additional effect to ensure select fields are properly set after component mounts
  useEffect(() => {
    if (!product && selectedKala) {
      try {
        const savedData = localStorage.getItem("product_form_data");
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          if (
            parsedData.selectedSchema === selectedSchema &&
            parsedData.formData
          ) {
            // Use setTimeout to ensure the component is fully rendered
            setTimeout(() => {
              Object.entries(parsedData.formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                  form.setValue(key, value, { shouldValidate: false });
                } else if (value === undefined || value === null) {
                  // Ensure undefined/null values become empty strings
                  form.setValue(key, "", { shouldValidate: false });
                }
              });
            }, 100);
          }
        }
      } catch (error) {
        console.error("Error updating select fields:", error);
      }
    }
  }, [selectedKala, product, selectedSchema, form]);

  // Get current variants from form state
  const currentVariants = form.watch("variants") || [];

  // Generate unique keys for variants to improve React rendering performance
  const variantsWithKeys = useMemo(
    () =>
      currentVariants.map((variant: any, index: number) => ({
        ...variant,
        key: variant.id || `variant-${index}`, // Use ID as key for stable rendering
      })),
    [currentVariants]
  );

  // Variant management functions
  const addVariant = useCallback(() => {
    const newVariant = {
      id: Date.now() + Math.random(), // Unique ID for new variant
      weight: "0",
      stock: 1,
      extras_price: "0",
      extras_wage: "0",
    };
    const updatedVariants = [...currentVariants, newVariant];
    form.setValue("variants", updatedVariants, { shouldValidate: true });
  }, [currentVariants, form]);

  const removeVariant = useCallback(
    (variantId: string | number) => {
      // Get the latest variants directly from the form to avoid stale closure issues
      const latestVariants = form.getValues("variants") || [];
      const updatedVariants = latestVariants.filter(
        (variant: any) => variant.id !== variantId
      );
      form.setValue("variants", updatedVariants, { shouldValidate: true });
    },
    [form]
  );

  const onSubmit = async (values: Record<string, any>) => {
    const skuId = bucketCode + Math.floor(100000 + Math.random() * 900000);
    try {
      const convertedValues = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
          reverseConvert(key),
          value,
        ])
      );

      const submissionData = {
        // ...convertedValues,
        bucket: bucketId,
        sku: skuId,
        pricing: {
          wage: values.wage,
          profit: values.profit,
        },
        kala: selectedSchema,
        digikalaData: {
          ...Object.fromEntries(
            Object.entries(convertedValues).filter(
              ([key]) =>
                key.startsWith("product[") || key.startsWith("attribute[")
            )
          ),
          //model
          // "product[title_fa]": `${skuId} ${getKalaTitle(
          //   selectedSchema
          // )} طلا ${getAiar(values["attribute#143&"])} مدل ${
          //   values["product#model&"]
          // } کد`,
        },
        images: productImageIds,
        variants: values.variants, // Use variants from form values
      };

      await createProduct(submissionData);

      // Clear localStorage after successful submission
      try {
        localStorage.removeItem("product_form_data");
      } catch (error) {
        console.error("Error clearing localStorage after submission:", error);
      }

      // redirect to bucket page
      router.push(`/dashboard/bucket/${bucketId}`);
      // Temporary success message for testing
      console.log("✅ Form submission completed successfully");
    } catch (error) {
      console.error("❌ Error in form submission:", error);
    }
  };

  const handleImageIdsChange = (imageIds: string[]) => {
    setProductImageIds(imageIds);
  };

  // Auto-save form data when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      saveFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, saveFormData]);

  if (isLoading) return <div>در حال بارگذاری دسته‌بندی‌ها...</div>;

  return (
    <div>
      <div className="w-full p-1">
        <div className="border-b pb-5 mb-5">
          <div className="flex items-center justify-between">
            <b className="text-xl">
              {product ? "ویرایش محصول" : "ایجاد محصول جدید"} | نام مجموعه (
              {bucketName}) | کد ({bucketCode})
            </b>
            {/* {!product && (
              <Button
                type="button"
                onClick={resetForm}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                پاک کردن همه انتخاب‌ها
              </Button>
            )} */}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="col-span-1 lg:col-span-3 order-2 lg:order-1">
            <div className="space-y-4 mb-6">
              {" "}
              {/* Added mb-6 for spacing */}
              <Label htmlFor="productCategorySelect">
                دسته بندی محصول را انتخاب کنید:
              </Label>
              <Select
                value={selectedSchema}
                onValueChange={(value) => {
                  setSelectedSchema(value);
                }}
              >
                <SelectTrigger
                  id="productCategorySelect"
                  className="w-full  lg:w-1/4"
                >
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {kalasData.map((item) => (
                    <SelectItem key={item._id} value={item._id.toString()}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 lg:grid-cols-3 gap-4"
              >
                <FormField
                  control={form.control}
                  name="wage" // This name is type-safe due to Record<string, any>
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        اجرت <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          value={field.value || "7"}
                          onChange={(e) => {
                            const numericValue = parseRial(e.target.value);
                            field.onChange(numericValue);
                          }}
                          placeholder="اجرت (درصد)"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profit" // This name is type-safe due to Record<string, any>
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        سود <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          value={field.value || "23"}
                          onChange={(e) => {
                            const numericValue = parseRial(e.target.value);
                            field.onChange(numericValue);
                          }}
                          placeholder="سود (درصد)"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Dynamic Fields from selectedKala */}
                {selectedSchema &&
                  Object.entries(
                    selectedKala?.data?.schema?.properties ?? {}
                  ).map(([key, property]: [string, any]) => {
                    if (
                      key === "wage" ||
                      key === "profit" ||
                      key === "variants"
                    )
                      return null;

                    const isFieldRequired =
                      selectedKala.data.schema.required?.includes(key);

                    if (property.type === "string" && !property.oneOf) {
                      return (
                        <FormField
                          key={key}
                          control={form.control}
                          name={convertBrackets(key)}
                          render={({ field }) => {
                            return (
                              <FormItem>
                                <FormLabel>
                                  {property.title || key}
                                  {isFieldRequired && (
                                    <span className="text-red-500">*</span>
                                  )}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder={property.title || key}
                                    className="w-full"
                                    // required={isFieldRequired}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      );
                    }

                    // Render select for oneOf types
                    if (property.oneOf) {
                      return (
                        <div className="w-full overflow-hidden" key={key}>
                          <FormField
                            key={key}
                            control={form.control}
                            name={convertBrackets(key)}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel>
                                    {property.title || key}
                                    {isFieldRequired && (
                                      <span className="text-red-500">*</span>
                                    )}
                                  </FormLabel>
                                  <Select
                                    value={field.value?.toString() || ""} // Ensure value is string
                                    onValueChange={field.onChange}
                                    // required={isFieldRequired}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="!w-full">
                                        <SelectValue placeholder="انتخاب کنید" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {property.oneOf.map((option: any) => (
                                        <SelectItem
                                          key={option.const}
                                          value={option.const?.toString() ?? ""}
                                        >
                                          {option.title}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </div>
                      );
                    }

                    if (property.type === "array" && property.items) {
                      return (
                        <Fragment key={key}>
                          <FormField
                            control={form.control}
                            name={convertBrackets(key)}
                            render={({ field }) => {
                              return (
                                <FormItem>
                                  <FormLabel>
                                    {property.title}
                                    {isFieldRequired && (
                                      <span className="text-red-500">*</span>
                                    )}
                                  </FormLabel>
                                  <FormControl>
                                    <MultipleSelector
                                      {...field}
                                      value={
                                        Array.isArray(field.value)
                                          ? field.value.map((id: string) => {
                                              const option =
                                                property.items.anyOf.find(
                                                  (item: any) =>
                                                    item.const === id
                                                );

                                              return {
                                                value: id,
                                                label: option?.title || id,
                                              };
                                            })
                                          : []
                                      }
                                      onChange={(options) => {
                                        // Transform to only send array of const IDs
                                        const ids = options.map(
                                          (option) => option.value
                                        );
                                        field.onChange(ids);
                                      }}
                                      defaultOptions={property.items.anyOf.map(
                                        (item: any) => ({
                                          value: item.const,
                                          label: item.title,
                                        })
                                      )}
                                      emptyIndicator={
                                        <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                                          موردی یافت نشد
                                        </p>
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />
                        </Fragment>
                      );
                    }

                    return null; // Fallback for unhandled property types/structures
                  })}

                {/* Product Variants Section */}
                <div className="col-span-1 lg:col-span-3 space-y-4">
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">ایجاد تنوع محصول</h3>
                      <Button
                        type="button"
                        onClick={addVariant}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        ایجاد تنوع جدید
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name="variants"
                      render={({ fieldState }) => (
                        <FormItem>
                          {fieldState.error && (
                            <FormMessage>
                              {fieldState.error.message}
                            </FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    {variantsWithKeys.map((variant: any, index: number) => (
                      <div
                        key={variant.key}
                        className="border rounded-lg p-4 space-y-4 mb-4"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">
                            تنوع محصول {index + 1}
                          </h4>
                          <Button
                            type="button"
                            onClick={() => removeVariant(variant.id)}
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                          <FormField
                            control={form.control}
                            name={`variants.${index}.weight`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  وزن <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="وزن"
                                    type="number"
                                    className="w-full"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.stock`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  موجودی <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="موجودی"
                                    className="w-full"
                                    type="number"
                                    min="0"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.extras_price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>قیمت اضافات</FormLabel>
                                <FormControl>
                                  <Input
                                    value={
                                      field.value ? parseInt(field.value) : ""
                                    }
                                    onChange={(e) => {
                                      // const numericValue = parseRial(
                                      //   e.target.value
                                      // );
                                      field.onChange(e.target.value);
                                    }}
                                    placeholder="قیمت اضافات (ریال)"
                                    className="w-full"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`variants.${index}.extras_wage`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>اجرت اضافات</FormLabel>
                                <FormControl>
                                  <Input
                                    value={
                                      field.value ? parseInt(field.value) : ""
                                    }
                                    onChange={(e) => {
                                      // const numericValue = parseRial(
                                      //   e.target.value
                                      // );
                                      field.onChange(e.target.value);
                                    }}
                                    placeholder="اجرت اضافات (ریال)"
                                    className="w-full"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button - Render only when a schema & images are selected */}
                {selectedSchema && productImageIds.length > 0 && (
                  <div className="col-span-1 lg:col-span-3 space-y-4">
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="w-full lg:w-auto bg-blue-500 text-white hover:bg-blue-600"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting
                          ? "در حال ثبت..."
                          : product
                          ? "به روز رسانی محصول"
                          : "ثبت محصول"}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </div>

          <div className="col-span-1 order-1 lg:order-2">
            <FileUploaderNew onImageIdsChange={handleImageIdsChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
