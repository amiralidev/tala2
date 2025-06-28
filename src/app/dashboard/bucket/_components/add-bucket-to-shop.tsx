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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Grid2X2Plus, Loader2, ShoppingBag, SquarePlus } from "lucide-react";
import Image from "next/image";
import { useBucketShops, useCreateTask } from "../_api/manage-shops";

interface AddBucketToShopProps {
  bucketName: string;
  bucket: string;
}

export function AddBucketToShop({ bucketName, bucket }: AddBucketToShopProps) {
  const { data: shopsDatas, isLoading, error } = useBucketShops(bucket);
  const createTaskMutation = useCreateTask();

  console.log(shopsDatas);
  const createTask = (shopId: string, type: string) => {
    createTaskMutation.mutate({
      type: type,
      shop: shopId,
      bucket: bucket,
      status: "not_started",
    });
  };

  return (
    <>
      <Dialog>
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
            {shopsDatas.map((shop) => {
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
                        {Object.entries(shop.status).map(([status, count]) => (
                          <Badge key={status} className="text-xs">
                            <span className="font-bold">{String(count)}</span>
                            <span className="mr-1">{status}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-4">
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
