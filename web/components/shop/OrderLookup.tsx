"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { lookupOrder } from "@/lib/orders/actions";
import { ORDER_NUMBER_RE } from "@/lib/orders/number";

/** Захиалгын дугаар + утсаар хайж, таарвал захиалгын хуудас руу шилжүүлнэ */
export function OrderLookup() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<"idle" | "invalid" | "notFound">("idle");
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const number = code.trim().toUpperCase();
    if (!ORDER_NUMBER_RE.test(number)) {
      setResult("invalid");
      return;
    }
    startTransition(async () => {
      const res = await lookupOrder({ number, phone });
      if (res.ok) router.push(`/zahialga/${res.number}`);
      else setResult("notFound");
    });
  }

  return (
    <div className="mt-6 rounded-card border border-brand/25 bg-brand-tint p-5">
      <h3 className="text-h3">Захиалгаа шалгах</h3>
      <p className="mt-1.5 text-small text-ink-2">
        Дугаарын хэлбэр: UDS-260911-4821
      </p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setResult("idle");
          }}
          error={result === "invalid"}
          placeholder="UDS-260911-4821"
          aria-label="Захиалгын дугаар"
        />
        <Input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setResult("idle");
          }}
          placeholder="Утас: 9911-2233"
          aria-label="Утасны дугаар"
        />
        <Button type="submit" className="shrink-0" loading={pending}>
          Хайх
        </Button>
      </form>

      {result === "invalid" && (
        <p className="mt-2 text-small text-danger">
          Дугаарын хэлбэр буруу байна. UDS-XXXXXX-XXXX хэлбэрээр оруулна уу.
        </p>
      )}
      {result === "notFound" && (
        <p className="mt-2 text-small text-danger">
          Захиалга олдсонгүй. Дугаар, утсаа шалгана уу. Тусламж хэрэгтэй бол
          7700-1234 руу залгана уу.
        </p>
      )}
    </div>
  );
}
