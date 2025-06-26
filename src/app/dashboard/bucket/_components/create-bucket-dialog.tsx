"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useCreateBucket } from "../_api/manage-bucket";

interface CreateBucketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refreshData: () => Promise<void>;
}

const bucketSchema = z.object({
  bucketName: z
    .string()
    .min(3, { message: "نام مجموعه باید حداقل ۳ کاراکتر باشد" }),
  bucketCode: z.string().min(1, { message: "کد مجموعه الزامی است" }),
});

export function CreateBucketDialog({
  open,
  onOpenChange,
  refreshData,
}: CreateBucketDialogProps) {
  const [errors, setErrors] = useState<z.ZodError | null>(null);

  const createBucketMutation = useCreateBucket();

  const form = useForm<z.infer<typeof bucketSchema>>({
    resolver: zodResolver(bucketSchema),
    defaultValues: {
      bucketName: "",
      bucketCode: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof bucketSchema>) => {
    try {
      await createBucketMutation.mutateAsync({
        name: values.bucketName,
        code: values.bucketCode,
      });

      await refreshData();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>مجموعه جدید</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ایجاد مجموعه</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="bucketName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام مجموعه</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bucketCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>کد مجموعه</FormLabel>
                  <FormControl>
                    <Input placeholder="کد مجموعه" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={createBucketMutation.isPending}>
              {createBucketMutation.isPending
                ? "در حال ایجاد..."
                : "ایجاد مجموعه"}
            </Button>

            {createBucketMutation.error && (
              <div className="text-red-500 text-sm">
                خطا در ایجاد مجموعه: {createBucketMutation.error.message}
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
