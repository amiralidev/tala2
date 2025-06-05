"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useMemo, useState } from "react"; // Added useCallback

import { FileUploaderNew } from "@/components/file-uploader-new";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatRial, parseRial } from "@/utils/rial-formatter";
import { convertBrackets, reverseConvert } from "@/utils/zod-schema-converter";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod"; // Using 'zod' directly, v4 is usually implied by project setup
import { useKalas } from "../_api/manage-kalas";
import { createProduct } from "../_api/manage-product";

// Variant schema
const variantSchema = z.object({
    weight: z.string().min(1, { message: "وزن الزامی است" }),
    inventory: z.string().min(1, { message: "موجودی الزامی است" }),
    extras_price: z.string().optional(),
    extras_wage: z.string().optional(),
});

const baseSchema = z.object({
    // sku: z.string().min(1, { message: "شناسه الزامی است" }),
    wage: z.string().min(1, { message: "اجرت الزامی است" }),
    profit: z.string().min(1, { message: "سود الزامی است" }),
    variants: z.array(variantSchema).min(1, { message: "حداقل یک نوع محصول الزامی است" }),
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
    const [dynamicSchemaParts, setDynamicSchemaParts] = useState<Record<string, z.ZodTypeAny>>({});
    const [formDefaultValues, setFormDefaultValues] = useState<Record<string, any>>(() => {
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
                    inventory: "",
                    extras_price: "",
                    extras_wage: "",
                },
            ],
        };
        if (product && selectedKala?.data?.schema?.properties) {
            Object.entries(selectedKala.data.schema.properties).forEach(([key, propDef]: [string, any]) => {
                // if (key === "sku") return;
                if (key === "wage") return;
                if (key === "profit") return;
                if (key === "variants") return;
                initialDefaults[convertBrackets(key)] = "";
            });
        }
        return initialDefaults;
    });

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
                        inventory: "",
                        extras_price: "",
                        extras_wage: "",
                    },
                ].map((variant: any, index: number) => ({
                    ...variant,
                    id: variant.id || `default-${index}-${Date.now()}`, // Ensure ID exists
                })),
        };

        if (selectedKala?.data?.schema?.properties) {
            const properties = selectedKala.data.schema.properties;
            const requiredFields = selectedKala.data.schema.required || [];

            Object.entries(properties).forEach(([key, propDef]: [string, any]) => {
                // if (key === "sku") return; // SKU is in baseSchema
                if (key === "variants") return; // Variants is in baseSchema
                if (key === "wage") return; // wage is in baseSchema
                if (key === "profit") return; // profit is in baseSchema

                // const fieldTitle = propDef.title || key;
                const fieldTitle = propDef.title || key;
                const isRequired = requiredFields.includes(key);
                let fieldSchema: z.ZodTypeAny;
                let s = z.string({
                    invalid_type_error: `${fieldTitle} نامعتبر است.`,
                });
                if (isRequired) {
                    fieldSchema = s.min(1, { message: `${fieldTitle} الزامی است` });
                } else {
                    fieldSchema = z.preprocess((v) => (v === "" ? undefined : v), s.optional());
                }
                newDynamicSchema[convertBrackets(key)] = fieldSchema;
                // Set default value: product's value > schema default > type default
                newDefaults[convertBrackets(key)] =
                    product?.[convertBrackets(key)] !== undefined ? product[convertBrackets(key)] : "";
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

    // Effect to reset the form when defaultValues or the schema itself changes.
    // This is crucial for react-hook-form to pick up new defaults and structure.
    useEffect(() => {
        form.reset(formDefaultValues);
    }, [formDefaultValues, currentFormSchema, form.reset]);

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
            weight: "",
            inventory: "",
            extras_price: "",
            extras_wage: "",
        };
        const updatedVariants = [...currentVariants, newVariant];
        form.setValue("variants", updatedVariants, { shouldValidate: true });
    }, [currentVariants, form]);

    const removeVariant = useCallback(
        (variantId: string | number) => {
            // Get the latest variants directly from the form to avoid stale closure issues
            const latestVariants = form.getValues("variants") || [];
            const updatedVariants = latestVariants.filter((variant: any) => variant.id !== variantId);
            form.setValue("variants", updatedVariants, { shouldValidate: true });
        },
        [form]
    );

    const onSubmit = async (values: Record<string, any>) => {
        try {
            const convertedValues = Object.fromEntries(
                Object.entries(values).map(([key, value]) => [reverseConvert(key), value])
            );

            const submissionData = {
                // ...convertedValues,
                bucket: bucketId,
                sku: bucketCode + Math.floor(100000 + Math.random() * 900000),
                pricing: {
                    wage: values.wage,
                    profit: values.profit,
                },
                kala: selectedSchema,
                digikalaData: {
                    ...Object.fromEntries(
                        Object.entries(convertedValues).filter(
                            ([key]) => key.startsWith("product[") || key.startsWith("attribute[")
                        )
                    ),
                },
                images: productImageIds,
                variants: values.variants, // Use variants from form values
            };

            await createProduct(submissionData);

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

    if (isLoading) return <div>در حال بارگذاری دسته‌بندی‌ها...</div>;

    return (
        <div>
            <div className="w-full p-1">
                <div className="border-b pb-5 mb-5">
                    <b className="text-xl">
                        {product ? "ویرایش محصول" : "ایجاد محصول جدید"} | نام مجموعه ({bucketName}) | کد ({bucketCode})
                    </b>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="col-span-1 lg:col-span-3 ">
                        <div className="space-y-4 mb-6">
                            {" "}
                            {/* Added mb-6 for spacing */}
                            <Label htmlFor="productCategorySelect">دسته بندی محصول را انتخاب کنید:</Label>
                            <Select
                                value={selectedSchema}
                                onValueChange={(value) => {
                                    setSelectedSchema(value);
                                }}
                            >
                                <SelectTrigger id="productCategorySelect" className="w-full lg:w-[342px]">
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
                                                    value={field.value ? field.value : ""}
                                                    onChange={(e) => {
                                                        const numericValue = parseRial(e.target.value);
                                                        field.onChange(numericValue);
                                                    }}
                                                    placeholder="اجرت (درصد)"
                                                    className="w-full lg:w-[342px]"
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
                                                    value={field.value ? field.value : ""}
                                                    onChange={(e) => {
                                                        const numericValue = parseRial(e.target.value);
                                                        field.onChange(numericValue);
                                                    }}
                                                    placeholder="سود (درصد)"
                                                    className="w-full lg:w-[342px]"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Dynamic Fields from selectedKala */}
                                {selectedSchema &&
                                    Object.entries(selectedKala?.data?.schema?.properties ?? {}).map(
                                        ([key, property]: [string, any]) => {
                                            if (key === "wage" || key === "profit" || key === "variants") return null;

                                            const isFieldRequired = selectedKala.data.schema.required?.includes(key);

                                            if (property.type === "string" && !property.oneOf) {
                                                return (
                                                    <FormField
                                                        key={key}
                                                        control={form.control}
                                                        name={convertBrackets(key)}
                                                        render={({ field, fieldState }) => {
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
                                                                            className="w-full lg:w-[342px]"
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
                                                    <FormField
                                                        key={key}
                                                        control={form.control}
                                                        name={convertBrackets(key)}
                                                        render={({ field, fieldState }) => {
                                                            // console.log(fieldState.error?.message);
                                                            // console.log(field.value);
                                                            // console.log(field.name);
                                                            return (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        {property.title || key}
                                                                        {isFieldRequired && (
                                                                            <span className="text-red-500">*</span>
                                                                        )}
                                                                    </FormLabel>
                                                                    <Select
                                                                        value={field.value?.toString() ?? ""} // Ensure value is string
                                                                        onValueChange={field.onChange}
                                                                        // required={isFieldRequired}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger className="w-full lg:w-[342px]">
                                                                                <SelectValue placeholder="انتخاب کنید" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            {property.oneOf.map((option: any) => (
                                                                                <SelectItem
                                                                                    key={option.const}
                                                                                    value={
                                                                                        option.const?.toString() ?? ""
                                                                                    }
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
                                                );
                                            }

                                            if (property.type === "array" && property.items) {
                                                return (
                                                    <>
                                                        <FormField
                                                            key={key}
                                                            control={form.control}
                                                            name={convertBrackets(key)}
                                                            render={({ field, fieldState }) => {
                                                                return (
                                                                    <FormItem>
                                                                        <FormLabel>
                                                                            {property.title}
                                                                            {isFieldRequired && (
                                                                                <span className="text-red-500">*</span>
                                                                            )}
                                                                        </FormLabel>
                                                                        <Select
                                                                            value={field.value?.toString() ?? ""} // Ensure value is string
                                                                            onValueChange={field.onChange}
                                                                            // required={isFieldRequired}
                                                                        >
                                                                            <FormControl>
                                                                                <SelectTrigger className="w-full lg:w-[342px]">
                                                                                    <SelectValue placeholder="انتخاب کنید" />
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent>
                                                                                {property.items.anyOf.map(
                                                                                    (option: any) => (
                                                                                        <SelectItem
                                                                                            key={option.const}
                                                                                            value={
                                                                                                option.const?.toString() ??
                                                                                                ""
                                                                                            }
                                                                                        >
                                                                                            {option.title}
                                                                                        </SelectItem>
                                                                                    )
                                                                                )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                );
                                                            }}
                                                        />
                                                    </>
                                                );
                                            }

                                            return null; // Fallback for unhandled property types/structures
                                        }
                                    )}

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
                                                ایجاد نوع جدید
                                            </Button>
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="variants"
                                            render={({ fieldState }) => (
                                                <FormItem>
                                                    {fieldState.error && (
                                                        <FormMessage>{fieldState.error.message}</FormMessage>
                                                    )}
                                                </FormItem>
                                            )}
                                        />

                                        {variantsWithKeys.map((variant, index) => (
                                            <div key={variant.key} className="border rounded-lg p-4 space-y-4 mb-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium">تنوع محصول {index + 1}</h4>
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
                                                        render={({ field, fieldState }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    وزن <span className="text-red-500">*</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="وزن"
                                                                        className="w-full"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`variants.${index}.inventory`}
                                                        render={({ field, fieldState }) => (
                                                            <FormItem>
                                                                <FormLabel>
                                                                    موجودی <span className="text-red-500">*</span>
                                                                </FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        type="text"
                                                                        placeholder="موجودی"
                                                                        className="w-full"
                                                                        min="1"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name={`variants.${index}.extras_price`}
                                                        render={({ field, fieldState }) => (
                                                            <FormItem>
                                                                <FormLabel>قیمت اضافات</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        value={
                                                                            field.value ? formatRial(field.value) : ""
                                                                        }
                                                                        onChange={(e) => {
                                                                            const numericValue = parseRial(
                                                                                e.target.value
                                                                            );
                                                                            field.onChange(numericValue);
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
                                                        render={({ field, fieldState }) => (
                                                            <FormItem>
                                                                <FormLabel>اجرت اضافات</FormLabel>
                                                                <FormControl>
                                                                    <Input
                                                                        value={
                                                                            field.value ? formatRial(field.value) : ""
                                                                        }
                                                                        onChange={(e) => {
                                                                            const numericValue = parseRial(
                                                                                e.target.value
                                                                            );
                                                                            field.onChange(numericValue);
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

                    <div className="col-span-1">
                        <FileUploaderNew onImageIdsChange={handleImageIdsChange} />
                    </div>
                </div>
            </div>
        </div>
    );
}
