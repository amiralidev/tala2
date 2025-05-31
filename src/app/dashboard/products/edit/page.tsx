"use client";

import ProductForm from "../create/page";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const bucket = searchParams.get("bucket");
  const sku = searchParams.get("sku");

  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!bucket || !sku) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/product?bucket=${bucket}&sku=${sku}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        data["bucket"] = bucket;
        setProductData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };
    fetchData();
  }, [bucket, sku]);
  if (!bucket || !sku) {
    return <div className="text-red-500">محصول یا مجموعه مشخص نشده است.</div>;
  }

  if (loading) return <div>در حال بارگذاری...</div>;

  return (
    <div>
      {productData ? (
        <ProductForm product={productData} />
      ) : (
        <div className="text-gray-500">محصول یافت نشد</div>
      )}
    </div>
  );
}
