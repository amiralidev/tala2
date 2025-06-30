"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { Eye, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useBuckets } from "./_api/manage-bucket";
import { AddBucketToShop } from "./_components/add-bucket-to-shop";
import { CreateBucketDialog } from "./_components/create-bucket-dialog";

export default function BucketsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: bucketsDatas, isLoading, error } = useBuckets();
  const queryClient = useQueryClient();
  // refresh Data when create bucket
  async function refreshData() {
    await queryClient.invalidateQueries({ queryKey: ["buckets"] });
  }

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">مجموعه ها</h1>
        <CreateBucketDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          refreshData={refreshData}
        />
      </div>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">کد مجموعه</TableHead>
              <TableHead className="text-right">نام مجموعه</TableHead>
              <TableHead className="text-right">نام برند</TableHead>
              <TableHead className="text-right">نام تامیین کننده</TableHead>
              <TableHead className="text-right">تعداد مجموعه</TableHead>
              <TableHead className="text-right">فروشگاه ها</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  در حال بارگذاری...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-red-500"
                >
                  خطا در بارگذاری مجموعه‌ها
                </TableCell>
              </TableRow>
            ) : bucketsDatas.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  هیچ مجموعه‌ای یافت نشد
                </TableCell>
              </TableRow>
            ) : (
              bucketsDatas.map((bucket, index) => (
                <TableRow
                  key={bucket.name}
                  className={index % 2 !== 0 ? "bg-zinc-100" : ""}
                >
                  <TableCell>{bucket.code}</TableCell>
                  <TableCell>{bucket.name}</TableCell>
                  <TableCell>{bucket.brand}</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right flex items-center gap-2">
                    <Link
                      href={`/dashboard/bucket/${bucket._id}`}
                      className={clsx(
                        buttonVariants(),
                        "!bg-green-500 text-white"
                      )}
                    >
                      <Eye className="w-4 h-4" />
                      مشاهده مجموعه
                    </Link>
                    <Link
                      href={`/dashboard/products/create?bucketCode=${bucket.code}&bucketName=${bucket.name}&bucketId=${bucket._id}`}
                      className={clsx(
                        buttonVariants(),
                        "!bg-blue-500 text-white"
                      )}
                    >
                      <Plus className="w-4 h-4" />
                      اضافه کردن محصول
                    </Link>
                    <AddBucketToShop
                      bucketName={bucket.name}
                      bucket={bucket._id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
