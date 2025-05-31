"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams } from "next/navigation";
import { useBucket } from "../_api/manage-bucket";

export default function BucketsPage() {
  const { bucket } = useParams();
  const {
    data: products,
    isLoading,
    error,
  } = useBucket({ bucketId: bucket as string });

  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">مجموعه {bucket}</h1>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell colSpan={2} className="text-center py-8">
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
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  هیچ مجموعه‌ای یافت نشد
                </TableCell>
              </TableRow>
            ) : (
              products.map((product, index) => (
                <TableRow
                  key={product._id}
                  className={index % 2 !== 0 ? "bg-zinc-100" : ""}
                >
                  <TableCell>
                    {product.digikalaData["product[title_fa]"]}
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.pricing.wage}</TableCell>
                  <TableCell>{product.pricing.profit}</TableCell>
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
