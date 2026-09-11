import type { Metadata } from "next";
import { Shell } from "@/components/layout/Shell";
import { WishlistView } from "@/components/shop/WishlistView";

export const metadata: Metadata = { title: "Хүслийн жагсаалт" };

export default function WishlistPage() {
  return (
    <Shell mobileTitle="Хүслийн жагсаалт" mobileActions="cart">
      <WishlistView />
    </Shell>
  );
}
