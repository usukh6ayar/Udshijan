"use client";

import { useRef, useState } from "react";
import { Alert } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FieldRow, Input, Select, Textarea } from "@/components/ui/Field";

const TOPICS = [
  "Захиалгын талаар",
  "Буцаалт, солилцоо",
  "Бөөний худалдаа",
  "Гомдол, санал",
  "Бусад",
];

type Errors = Record<string, string | undefined>;

export function ContactForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found: Errors = {};

    if (name.trim().length < 2) found.name = "Нэрээ бүтэн бичнэ үү.";

    const value = contact.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isPhone = value.replace(/\D/g, "").length === 8;
    if (!isEmail && !isPhone) {
      found.contact = "Утасны дугаар (8 орон) эсвэл и-мэйл хаягаа оруулна уу.";
    }

    if (message.trim().length < 10) {
      found.message = "Зурвасаа арай дэлгэрэнгүй бичнэ үү (10-с дээш тэмдэгт).";
    }

    setErrors(found);
    if (Object.keys(found).length > 0) {
      formRef.current
        ?.querySelector<HTMLElement>(`#${Object.keys(found)[0]}`)
        ?.focus();
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <Alert tone="success">
          Зурвас хүлээн авлаа. Энэ бол демо дэлгүүр тул зурвас сервер рүү
          илгээгдээгүй — яаралтай бол 7700-1234 руу залгана уу.
        </Alert>
        <Button
          variant="secondary"
          onClick={() => {
            setSent(false);
            setMessage("");
          }}
        >
          Шинэ зурвас бичих
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow id="name" label="Нэр" required error={errors.name}>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Овог, нэр"
            value={name}
            error={Boolean(errors.name)}
            onChange={(e) => setName(e.target.value)}
          />
        </FieldRow>

        <FieldRow
          id="contact"
          label="Утас эсвэл и-мэйл"
          required
          error={errors.contact}
        >
          <Input
            id="contact"
            name="contact"
            placeholder="9911-2233 эсвэл name@example.com"
            value={contact}
            error={Boolean(errors.contact)}
            onChange={(e) => setContact(e.target.value)}
          />
        </FieldRow>
      </div>

      <FieldRow id="topic" label="Сэдэв">
        <Select
          id="topic"
          name="topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
      </FieldRow>

      <FieldRow id="message" label="Зурвас" required error={errors.message}>
        <Textarea
          id="message"
          name="message"
          placeholder="Асуух зүйлээ бичнэ үү…"
          value={message}
          error={Boolean(errors.message)}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-36"
        />
      </FieldRow>

      <Button type="submit" size="lg">
        Зурвас илгээх
      </Button>
    </form>
  );
}
