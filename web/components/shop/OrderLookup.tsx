"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

/**
 * Захиалгын дугаараар хайх демо форм. Backend байхгүй тул үргэлж «олдсонгүй»
 * гэж хариулна — хуурамч захиалга зохиохгүй.
 */
export function OrderLookup() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<"idle" | "invalid" | "notFound">("idle");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = code.trim().toUpperCase();
    setResult(/^UDS-\d{6}-\d{4}$/.test(value) ? "notFound" : "invalid");
  }

  return (
    <div className="mt-6 rounded-card border border-brand/25 bg-brand-tint p-5">
      <h3 className="text-h3">Захиалгын дугаараар хайх</h3>
      <p className="mt-1.5 text-small text-ink-2">
        Дугаарын хэлбэр: UDS-260911-4821
      </p>

      <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
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
        <Button type="submit" className="shrink-0">
          Хайх
        </Button>
      </form>

      {result === "invalid" && (
        <p className="mt-2 text-small text-danger">
          Дугаарын хэлбэр буруу байна. UDS-XXXXXX-XXXX хэлбэрээр оруулна уу.
        </p>
      )}

      {result === "notFound" && (
        <div className="mt-3">
          <Alert>
            Энэ бол демо дэлгүүр тул захиалгын мэдээлэл хадгалагддаггүй. Бодит
            захиалгаа шалгахыг хүсвэл 7700-1234 руу залгана уу.
          </Alert>
        </div>
      )}
    </div>
  );
}
