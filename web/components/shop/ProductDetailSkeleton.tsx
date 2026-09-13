import { Skeleton } from "@/components/ui/Badge";

/**
 * PDP-ийн runtime агуулгыг хүлээх үеийн бүрхүүл.
 * Build дээр байгаагүй (админ шинээр үүсгэсэн) бараа руу орох үед статик
 * бүрхүүлд энэ харагдаад, бодит агуулга ард нь урсан ирнэ.
 */
export function ProductDetailSkeleton() {
  return (
    <div className="container-uds grid gap-8 py-6 pb-10 lg:grid-cols-2 lg:gap-10">
      <Skeleton className="aspect-3/4 w-full" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-7 w-3/4 rounded-btn" />
        <Skeleton className="h-5 w-1/3 rounded-btn" />
        <Skeleton className="h-10 w-1/2 rounded-btn" />
        <Skeleton className="mt-4 h-24 w-full" />
        <Skeleton className="mt-2 h-12 w-full rounded-btn" />
      </div>
    </div>
  );
}
