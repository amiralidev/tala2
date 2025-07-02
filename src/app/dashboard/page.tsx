"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { LogOut } from "lucide-react";

export default function Page() {
  const { logout } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">داشبورد</h1>
        <Button onClick={logout} variant="outline">
          <LogOut className="ml-2 h-4 w-4" />
          خروج
        </Button>
      </div>
    </div>
  );
}
