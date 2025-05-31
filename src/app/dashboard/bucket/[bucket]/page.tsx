"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createBucket, useBuckets } from "../_api/manage-bucket";
import { useQueryClient } from "@tanstack/react-query";

export default function BucketsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bucketName, setBucketName] = useState("");
  const [bucketCode, setBucketCode] = useState("");
  const { data: buckets, isLoading, error } = useBuckets();
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!/^[a-zA-Z0-9-]+$/.test(bucketName)) {
      toast("Invalid name", {
        description:
          "No spaces or dots allowed. Use only letters, numbers, or hyphens.",
      });
      return;
    }

    try {
      // TODO: Add a loading state
      const newBucket = await createBucket({
        name: bucketName,
        code: bucketName,
      }); // Assuming code can be the same as name for now
      toast("Bucket created", {
        description: `Bucket "${newBucket.name}" was successfully created.`,
      });
      setBucketName("");
      setDialogOpen(false);
    } catch (error) {
      toast("Failed to create bucket", {
        description: "Something went wrong while creating the bucket.",
      });
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">مجموعه ها</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>مجموعه جدید</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ایجاد مجموعه</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="bucket-name"
              value={bucketName}
              onChange={(e) => setBucketName(e.target.value)}
            />
            <Button onClick={handleCreate}>Create</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">نام</TableHead>
            <TableHead className="text-right">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-8">
                در حال بارگذاری...
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-8 text-red-500">
                خطا در بارگذاری مجموعه‌ها
              </TableCell>
            </TableRow>
          ) : buckets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="text-center py-8 text-gray-500">
                هیچ مجموعه‌ای یافت نشد
              </TableCell>
            </TableRow>
          ) : (
            buckets.map((bucket) => (
              <TableRow key={bucket.name}>
                <TableCell>{bucket.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/dashboard/bucket/${bucket.name}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link
                    href={`/dashboard/product/create?bucket=${bucket.name}`}
                  >
                    <Button variant="ghost" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
