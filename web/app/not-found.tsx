import { SearchX } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <Shell>
      <div className="container-uds py-16">
        <div className="mx-auto max-w-lg rounded-card border border-line bg-white">
          <EmptyState
            icon={<SearchX className="size-6" />}
            title="Хуудас олдсонгүй"
            description="Энэ хэсэг одоогоор бэлэн болоогүй эсвэл хаяг буруу байна."
            actionLabel="Нүүр хуудас руу"
            actionHref="/"
          />
        </div>
      </div>
    </Shell>
  );
}
