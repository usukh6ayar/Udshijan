import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { logout } from "@/lib/admin/login-action";
import { cx } from "@/lib/format";

export function AdminNav({ active }: { active: "products" | "orders" }) {
  const tab = (key: typeof active) =>
    cx(
      "pb-3 -mb-px border-b-2",
      active === key
        ? "border-ink text-ink"
        : "border-transparent text-ink-2 hover:text-ink",
    );

  return (
    <nav className="mb-6 flex items-end justify-between gap-4 border-b border-line">
      <div className="flex gap-5 text-body font-medium">
        <Link href="/admin" className={tab("products")}>
          Бүтээгдэхүүн
        </Link>
        <Link href="/admin/zahialga" className={tab("orders")}>
          Захиалга
        </Link>
      </div>
      <form action={logout} className="pb-2">
        <Button type="submit" variant="ghost" size="sm">
          Гарах
        </Button>
      </form>
    </nav>
  );
}
