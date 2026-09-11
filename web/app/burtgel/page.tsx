import type { Metadata } from "next";
import { Shell } from "@/components/layout/Shell";
import { AuthView } from "@/components/shop/AuthView";

export const metadata: Metadata = { title: "Миний бүртгэл" };

export default function AccountPage() {
  return (
    <Shell mobileTitle="Миний бүртгэл" mobileActions="cart">
      <AuthView />
    </Shell>
  );
}
