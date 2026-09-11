"use client";

import { useRef, useState } from "react";
import { Alert } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Checkbox,
  FieldRow,
  Input,
  Select,
  Textarea,
} from "@/components/ui/Field";
import { categories } from "@/lib/data/catalog";

const VOLUMES = [
  "1 сая₮ хүртэл",
  "1–5 сая₮",
  "5–20 сая₮",
  "20 сая₮-с дээш",
];

type Errors = Record<string, string | undefined>;

export function WholesaleForm() {
  const [org, setOrg] = useState("");
  const [register, setRegister] = useState("");
  const [person, setPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState(categories[0].name);
  const [volume, setVolume] = useState(VOLUMES[1]);
  const [note, setNote] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found: Errors = {};

    if (org.trim().length < 2) found.org = "Байгууллагын нэрээ бичнэ үү.";
    // Монголын хуулийн этгээдийн регистр 7 орон, иргэний бол 10 тэмдэгт
    if (!/^\d{7}$|^[А-ЯӨҮа-яөү]{2}\d{8}$/.test(register.trim())) {
      found.register = "Регистр 7 оронтой тоо эсвэл АА12345678 хэлбэртэй байна.";
    }
    if (person.trim().length < 2) found.person = "Холбогдох хүний нэрийг бичнэ үү.";
    if (phone.replace(/\D/g, "").length !== 8) {
      found.phone = "Утасны дугаар 8 оронтой байх ёстой.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      found.email = "И-мэйл хаяг буруу байна.";
    }
    if (!terms) found.terms = "Бөөний худалдааны нөхцөлийг зөвшөөрнө үү.";

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
          Өргөдөл хүлээн авлаа. Энэ бол демо дэлгүүр тул мэдээлэл сервер рүү
          илгээгдээгүй — бодит хүсэлтээ 7700-1234 эсвэл info@udshijan.mn хаягаар
          илгээнэ үү.
        </Alert>
        <Button variant="secondary" onClick={() => setSent(false)}>
          Дахин бөглөх
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldRow id="org" label="Байгууллагын нэр" required error={errors.org}>
          <Input
            id="org"
            name="org"
            autoComplete="organization"
            placeholder="ж: Тэргэл Трейд ХХК"
            value={org}
            error={Boolean(errors.org)}
            onChange={(e) => setOrg(e.target.value)}
          />
        </FieldRow>

        <FieldRow
          id="register"
          label="Регистрийн дугаар"
          required
          error={errors.register}
          hint="Хуулийн этгээд: 7 орон · Иргэн: АА12345678"
        >
          <Input
            id="register"
            name="register"
            placeholder="1234567"
            value={register}
            error={Boolean(errors.register)}
            onChange={(e) => setRegister(e.target.value)}
          />
        </FieldRow>

        <FieldRow
          id="person"
          label="Холбогдох хүн"
          required
          error={errors.person}
        >
          <Input
            id="person"
            name="person"
            autoComplete="name"
            placeholder="Овог, нэр"
            value={person}
            error={Boolean(errors.person)}
            onChange={(e) => setPerson(e.target.value)}
          />
        </FieldRow>

        <FieldRow id="phone" label="Утасны дугаар" required error={errors.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="9911-2233"
            value={phone}
            error={Boolean(errors.phone)}
            onChange={(e) => setPhone(e.target.value)}
          />
        </FieldRow>

        <FieldRow
          id="email"
          label="И-мэйл"
          required
          error={errors.email}
          hint="Гэрээ, нэхэмжлэх энэ хаягаар очно"
          className="sm:col-span-2"
        >
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.mn"
            value={email}
            error={Boolean(errors.email)}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FieldRow>

        <FieldRow id="category" label="Сонирхож буй ангилал">
          <Select
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.slug}>{c.name}</option>
            ))}
          </Select>
        </FieldRow>

        <FieldRow id="volume" label="Сарын дундаж худалдан авалт">
          <Select
            id="volume"
            name="volume"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
          >
            {VOLUMES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </Select>
        </FieldRow>

        <FieldRow
          id="note"
          label="Нэмэлт тайлбар"
          hint="Заавал биш — сонирхож буй бараа, тоо хэмжээ"
          className="sm:col-span-2"
        >
          <Textarea
            id="note"
            name="note"
            placeholder="Танилцуулга, шаардлагатай бараанууд…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </FieldRow>
      </div>

      <div>
        <Checkbox
          id="terms"
          checked={terms}
          error={Boolean(errors.terms)}
          onChange={setTerms}
          label="Бөөний худалдааны нөхцөлийг уншиж зөвшөөрсөн"
          description="Хамгийн бага захиалга 10 ширхэг, урьдчилгаа 30%"
        />
        {errors.terms && (
          <p className="mt-1.5 text-small text-danger">{errors.terms}</p>
        )}
      </div>

      <Button type="submit" size="lg">
        Өргөдөл илгээх
      </Button>
    </form>
  );
}
