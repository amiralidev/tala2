"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react"; // Import Suspense
import ProductForm from "../create/page";

// Create a separate component to encapsulate the client-side logic that uses useSearchParams
function ProductEditContent() {
  const searchParams = useSearchParams();
  const bucket = searchParams.get("bucket");
  const sku = searchParams.get("sku");

  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // If bucket or sku are missing, set loading to false immediately
      // and return to prevent unnecessary fetch attempts.
      if (!bucket || !sku) {
        setLoading(false);
        return;
      }

      setLoading(true); // Indicate that data fetching is in progress
      try {
        const res = await fetch(`/api/product?bucket=${bucket}&sku=${sku}`);
        if (!res.ok) {
          // Throw an error if the response is not OK
          throw new Error("Failed to fetch product");
        }
        const data = await res.json();
        // Add the bucket to the product data for consistency
        data["bucket"] = bucket;
        setProductData(data);
      } catch (err) {
        // Log any errors during the fetch operation
        console.error("Error fetching product data:", err);
        // Optionally, set productData to null or an error state
        setProductData(null);
      } finally {
        // Use a setTimeout to simulate a loading delay or ensure the spinner
        // is visible for a minimum duration. Remove if not needed.
        setTimeout(() => {
          setLoading(false); // Set loading to false once fetching is complete
        }, 1000); // 1-second delay
      }
    };

    fetchData(); // Call the async function
  }, [bucket, sku]); // Re-run effect if bucket or sku changes

  // Display a message if required parameters are missing
  if (!bucket || !sku) {
    return <div className="text-red-500">محصول یا مجموعه مشخص نشده است.</div>;
  }

  // Display a loading indicator while data is being fetched
  if (loading) {
    return <div>در حال بارگذاری...</div>;
  }

  // Render the ProductForm with fetched data or a "not found" message
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

// The main Page component, which acts as a server component initially
// and wraps the client-side logic in a Suspense boundary.
export default function Page() {
  return (
    // Wrap the client component with Suspense.
    // The `fallback` prop provides content to display while the client component
    // is hydrating or waiting for client-side data (like search params).
    <Suspense fallback={<div>در حال بارگذاری محصول...</div>}>
      <ProductEditContent />
    </Suspense>
  );
}
