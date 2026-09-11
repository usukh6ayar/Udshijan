import type { Metadata } from "next";
import { Shell } from "@/components/layout/Shell";
import { CartView } from "@/components/shop/CartView";

export const metadata: Metadata = { title: "Таны сагс" };

export default function CartPage() {
  return (
    <Shell>
      <CartView />
    </Shell>
  );
}
