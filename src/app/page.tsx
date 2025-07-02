"use client";

import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br font-mono text-xl from-yellow-200 to-black text-white flex items-center justify-center">
        <div className="animate-pulse">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br text-xl from-yellow-200 to-black text-white flex flex-col items-center justify-center">
      <div className="flex items-center mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6 ml-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
          />
        </svg>
        <span>خوش آمدید به داشبورد Talasys</span>
      </div>
      <Link href={"/login"} className={buttonVariants()}>
        ورود به سیستم
      </Link>
    </div>
  );
}
