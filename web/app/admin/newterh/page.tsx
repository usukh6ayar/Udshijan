"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { login } from "@/lib/admin/login-action";

export default function AdminLoginPage() {
  const [error, formAction, pending] = useActionState(login, null);

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-5">
      <h1 className="text-h2">Админ нэвтрэх</h1>
      <p className="mt-1.5 text-small text-ink-2">
        Бүтээгдэхүүн удирдахын тулд нууц үгээ оруулна уу.
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-3">
        <Input
          type="password"
          name="password"
          placeholder="Нууц үг"
          aria-label="Нууц үг"
          autoComplete="current-password"
          error={Boolean(error)}
          required
        />

        {error ? <Alert>{error}</Alert> : null}

        <Button type="submit" loading={pending} fullWidth>
          Нэвтрэх
        </Button>
      </form>
    </main>
  );
}
