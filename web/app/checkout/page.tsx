import type { Metadata } from "next";
import { Shell } from "@/components/layout/Shell";
import { CheckoutView } from "@/components/shop/CheckoutView";

export const metadata: Metadata = { title: "Захиалга баталгаажуулах" };

export default function CheckoutPage() {
  return (
    <Shell>
      <CheckoutView />
    </Shell>
  );
}
