"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { lookupOrder } from "@/lib/orders/actions";

/** Энэ браузерт захиалгын cookie байхгүй үед — утсаар баталгаажуулна */
export function OrderPhoneGate({ number }: { number: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotFound(false);
    startTransition(async () => {
      const res = await lookupOrder({ number, phone });
      if (res.ok) router.refresh();
      else setNotFound(true);
    });
  }

  return (
    <div className="mx-auto max-w-md rounded-card border border-line bg-white p-5">
      <h1 className="text-h2">Захиалга {number}</h1>
      <p className="mt-1.5 text-small text-ink-2">
        Захиалгаа харахын тулд захиалга өгөхдөө бичсэн утасны дугаараа оруулна уу.
      </p>
      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
        <Input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="9911-2233"
          aria-label="Утасны дугаар"
          value={phone}
          error={notFound}
          onChange={(e) => setPhone(e.target.value)}
        />
        {notFound && (
          <p className="text-small text-danger">
            Захиалга олдсонгүй. Дугаар, утсаа шалгана уу.
          </p>
        )}
        <Button type="submit" loading={pending}>
          Харах
        </Button>
      </form>
    </div>
  );
}
