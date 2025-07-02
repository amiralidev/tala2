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
import { skuFormatter } from "@/utils/sku-formatter";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useBucket } from "../_api/manage-bucket";

export default function BucketsPage() {
  const { bucket } = useParams();
  const {
    data: bucketData,
    isLoading,
    error,
  } = useBucket({ bucketId: bucket as string });

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          مجموعه {bucketData?.bucket?.brand}
        </h1>
        <Link
          href={`/dashboard/products/create?bucketCode=${bucketData?.bucket?.code}&bucketName=${bucketData?.bucket?.name}&bucketId=${bucketData?.bucket?._id}`}
          className={buttonVariants()}
        >
          ایجاد محصول جدید
        </Link>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">عکس</TableHead>
              <TableHead className="text-right">نام</TableHead>
              <TableHead className="text-right">sku</TableHead>
              <TableHead className="text-right">اجرت</TableHead>
              <TableHead className="text-right">سود</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  در حال بارگذاری...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center py-8 text-red-500"
                >
                  خطا در بارگذاری مجموعه‌ها
                </TableCell>
              </TableRow>
            ) : !bucketData ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  هیچ مجموعه‌ای یافت نشد
                </TableCell>
              </TableRow>
            ) : bucketData.products?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  هیچ محصولی در این مجموعه یافت نشد
                </TableCell>
              </TableRow>
            ) : (
              bucketData.products?.map((product, index) => (
                <TableRow
                  key={product._id}
                  className={index % 2 !== 0 ? "bg-zinc-100" : ""}
                >
                  <TableCell className="space-x-2 flex">
                    {product.images?.[0]?.url ? (
                      <div className="border rounded-md overflow-hidden">
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].url}
                          width={50}
                          height={50}
                          unoptimized
                        />
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell
                    style={{ direction: "ltr" }}
                    className="text-right"
                  >
                    {product.digikalaData?.["product[title_fa]"] ??
                      product.digikalaData?.["product[model]"] ??
                      "بدون نام"}
                  </TableCell>
                  <TableCell>{skuFormatter(product.sku)}</TableCell>
                  <TableCell>{product.pricing.wage.toString()} %</TableCell>
                  <TableCell>{product.pricing.profit.toString()} %</TableCell>
                  <TableCell className="text-right space-x-2">
                    {/* <Link href={`/dashboard/bucket/${bucket.name}`}>
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
                    </Link> */}
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
