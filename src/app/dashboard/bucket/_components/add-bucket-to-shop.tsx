"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Grid2X2Plus, Loader2, ShoppingBag, SquarePlus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useBucketShops, useCreateTask } from "../_api/manage-shops";

interface AddBucketToShopProps {
  bucketName: string;
  bucket: string;
}

export function AddBucketToShop({ bucketName, bucket }: AddBucketToShopProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryCodes, setCategoryCodes] = useState<Record<string, string>>(
    {}
  );
  const {
    data: shopsDatas,
    isLoading,
    error,
  } = useBucketShops(bucket, {
    enabled: isOpen,
  });
  const createTaskMutation = useCreateTask();

  const createTask = (shopId: string, type: string) => {
    const taskData: any = {
      type: type,
      shop: shopId,
      bucket: bucket,
      status: "not_started",
    };

    // Add extraFields for sazito marketplace
    if (
      shopsDatas?.find((shop) => shop._id === shopId)?.marketplace?.name ===
      "sazito"
    ) {
      const categoryCode = categoryCodes[shopId];
      if (categoryCode) {
        taskData.extraFields = {
          category: categoryCode,
        };
      }
    }

    createTaskMutation.mutate(taskData);
  };

  const handleCategoryCodeChange = (shopId: string, value: string) => {
    setCategoryCodes((prev) => ({
      ...prev,
      [shopId]: value,
    }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>
            {" "}
            <ShoppingBag className="w-4 h-4" />
            اضافه کردن به فروشگاه
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>فروشگاه های مجموعه {bucketName}</DialogTitle>
          </DialogHeader>
          <div className="divide-y mt-2 overflow-y-auto max-h-[340px]">
            {isLoading
              ? // Skeleton loading states
                Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-4 mb-4"
                  >
                    <div className="flex items-center gap-x-4">
                      <Skeleton className="w-10 h-10 rounded-md" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-2" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-12" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-x-4">
                      <Skeleton className="w-6 h-6" />
                      <Skeleton className="w-6 h-6" />
                    </div>
                  </div>
                ))
              : shopsDatas?.map((shop) => {
                  return (
                    <div
                      key={shop._id}
                      className="flex items-center justify-between border-b pb-4 mb-4"
                    >
                      <div className="flex items-center gap-x-4">
                        <Image
                          src={shop.marketplace.icon.url}
                          alt={shop.marketplace.title}
                          width={40}
                          height={40}
                          className="rounded-md border"
                        />
                        <div>
                          <div>
                            {shop.title} - {shop.marketplace?.title}
                          </div>
                          <div className="flex gap-2 mt-1">
                            {Object.entries(shop.status).map(
                              ([status, count]) => (
                                <Badge key={status} className="text-xs">
                                  <span className="font-bold">
                                    {String(count)}
                                  </span>
                                  <span className="mr-1">{status}</span>
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-x-4">
                        {shop.marketplace?.name === "sazito" ? (
                          <Input
                            type="number"
                            placeholder="کد دسته بندی"
                            className="w-32"
                            value={categoryCodes[shop._id] || ""}
                            onChange={(e) =>
                              handleCategoryCodeChange(shop._id, e.target.value)
                            }
                          />
                        ) : null}
                        <Tooltip>
                          <TooltipTrigger
                            onClick={() => createTask(shop._id, "create")}
                            disabled={createTaskMutation.isPending}
                          >
                            {createTaskMutation.isPending ? (
                              <Loader2 className="size-6 animate-spin" />
                            ) : (
                              <SquarePlus />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>اضافه کردن محصول</p>
                          </TooltipContent>
                        </Tooltip>
                        {shop.marketplace?.name === "digikala" ||
                        shop.marketplace?.name === "snapp" ? (
                          <Tooltip>
                            <TooltipTrigger
                              onClick={() => createTask(shop._id, "variant")}
                              disabled={createTaskMutation.isPending}
                            >
                              {createTaskMutation.isPending ? (
                                <Loader2 className="size-6 animate-spin" />
                              ) : (
                                <Grid2X2Plus />
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>اضافه کردن تنوع</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="w-6 h-6 rounded-md bg-zinc-100"></span>
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
