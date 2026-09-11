"use client";

import { useRef, useState } from "react";
import { Eye, EyeOff, Heart, Package, Percent, Zap } from "lucide-react";
import { Alert } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox, FieldRow, Input } from "@/components/ui/Field";
import { cx } from "@/lib/format";

type Tab = "login" | "register";

type Errors = Record<string, string | undefined>;

const BENEFITS = [
  {
    icon: Package,
    title: "Захиалгаа хянах",
    text: "Захиалгын явц, хүргэлтийн мэдээллийг нэг дороос",
  },
  {
    icon: Heart,
    title: "Хүслийн жагсаалт",
    text: "Дуртай бараагаа хадгалж, дараа нь авах",
  },
  {
    icon: Zap,
    title: "Хурдан төлбөр",
    text: "Хаяг, холбоо барих мэдээлэл урьдчилан бөглөгдөнө",
  },
  {
    icon: Percent,
    title: "Бөөний эрх",
    text: "Баталгаажсан харилцагчид бөөний үнээр худалдан авна",
  },
];

export function AuthView() {
  const [tab, setTab] = useState<Tab>("login");
  const [done, setDone] = useState(false);

  function switchTab(next: Tab) {
    setTab(next);
    setDone(false);
  }

  return (
    <div className="container-uds py-6 lg:py-10">
      <h1 className="text-h1">Миний бүртгэл</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] lg:gap-10">
        <div className="overflow-hidden rounded-card border border-line bg-white">
          <div role="tablist" className="grid grid-cols-2 border-b border-line">
            <TabBtn active={tab === "login"} onClick={() => switchTab("login")}>
              Нэвтрэх
            </TabBtn>
            <TabBtn
              active={tab === "register"}
              onClick={() => switchTab("register")}
            >
              Бүртгүүлэх
            </TabBtn>
          </div>

          <div className="p-5">
            {done ? (
              <div className="space-y-4">
                <Alert tone="success">
                  {tab === "login"
                    ? "Мэдээлэл хүлээн авлаа."
                    : "Бүртгэлийн мэдээлэл хүлээн авлаа."}{" "}
                  Энэ бол демо дэлгүүр — бүртгэл сервер дээр үүсэхгүй.
                </Alert>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setDone(false)}
                >
                  Дахин оролдох
                </Button>
              </div>
            ) : tab === "login" ? (
              <LoginForm onDone={() => setDone(true)} />
            ) : (
              <RegisterForm onDone={() => setDone(true)} />
            )}
          </div>
        </div>

        <div>
          <h2 className="text-h2">Бүртгэлтэй байхын давуу тал</h2>
          <ul className="mt-5 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="bg-white p-5">
                <Icon className="size-6 text-brand" />
                <h3 className="mt-3 text-h3">{title}</h3>
                <p className="mt-1 text-small text-ink-2">{text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-5 rounded-card bg-surface p-5 text-small text-ink-2">
            Асуудал гарвал{" "}
            <span className="font-bold text-ink">7700-1234</span> дугаарт
            залгаарай. Даваа–Ням, 09:00–20:00.
          </div>
        </div>
      </div>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cx(
        "h-12 text-btn transition-colors",
        active
          ? "border-b-2 border-brand bg-white text-brand"
          : "bg-surface text-ink-2 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

/** Утас (8 орон) эсвэл и-мэйл аль нэгээр нэвтрэхийг зөвшөөрнө */
function isValidLogin(value: string): boolean {
  const v = value.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return true;
  return v.replace(/\D/g, "").length === 8;
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found: Errors = {};
    if (!isValidLogin(login)) {
      found.login = "Утасны дугаар (8 орон) эсвэл и-мэйл хаягаа оруулна уу.";
    }
    if (password.length < 6) {
      found.password = "Нууц үг дор хаяж 6 тэмдэгт байна.";
    }
    setErrors(found);
    if (Object.keys(found).length > 0) {
      formRef.current
        ?.querySelector<HTMLElement>(`#${Object.keys(found)[0]}`)
        ?.focus();
      return;
    }
    onDone();
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-4">
      <FieldRow
        id="login"
        label="Утас эсвэл и-мэйл"
        required
        error={errors.login}
      >
        <Input
          id="login"
          name="login"
          autoComplete="username"
          placeholder="9911-2233 эсвэл name@example.com"
          value={login}
          error={Boolean(errors.login)}
          onChange={(e) => setLogin(e.target.value)}
        />
      </FieldRow>

      <PasswordField
        id="password"
        label="Нууц үг"
        value={password}
        error={errors.password}
        autoComplete="current-password"
        onChange={setPassword}
      />

      <div className="flex items-center justify-between gap-3">
        <Checkbox
          id="remember"
          checked={remember}
          onChange={setRemember}
          label="Намайг сана"
        />
        <span className="text-small text-ink-2">
          Нууц үгээ мартсан бол 7700-1234
        </span>
      </div>

      <Button type="submit" size="lg" fullWidth>
        Нэвтрэх
      </Button>
    </form>
  );
}

function RegisterForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found: Errors = {};
    if (name.trim().length < 2) found.name = "Нэрээ бүтэн бичнэ үү.";
    if (phone.replace(/\D/g, "").length !== 8) {
      found.phone = "Утасны дугаар 8 оронтой байх ёстой.";
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      found.email = "И-мэйл хаяг буруу байна.";
    }
    if (password.length < 6) found.password = "Нууц үг дор хаяж 6 тэмдэгт байна.";
    if (repeat !== password) found.repeat = "Нууц үг таарахгүй байна.";
    if (!terms) found.terms = "Үйлчилгээний нөхцөлийг зөвшөөрнө үү.";

    setErrors(found);
    if (Object.keys(found).length > 0) {
      formRef.current
        ?.querySelector<HTMLElement>(`#${Object.keys(found)[0]}`)
        ?.focus();
      return;
    }
    onDone();
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-4">
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
        error={errors.email}
        hint="Заавал биш"
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          error={Boolean(errors.email)}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FieldRow>

      <PasswordField
        id="password"
        label="Нууц үг"
        value={password}
        error={errors.password}
        hint="Дор хаяж 6 тэмдэгт"
        autoComplete="new-password"
        onChange={setPassword}
      />

      <PasswordField
        id="repeat"
        label="Нууц үг давтах"
        value={repeat}
        error={errors.repeat}
        autoComplete="new-password"
        onChange={setRepeat}
      />

      <div>
        <Checkbox
          id="terms"
          checked={terms}
          error={Boolean(errors.terms)}
          onChange={setTerms}
          label="Үйлчилгээний нөхцөл, нууцлалын бодлогыг зөвшөөрч байна"
        />
        {errors.terms && (
          <p className="mt-1.5 text-small text-danger">{errors.terms}</p>
        )}
      </div>

      <Button type="submit" size="lg" fullWidth>
        Бүртгүүлэх
      </Button>
    </form>
  );
}

function PasswordField({
  id,
  label,
  value,
  error,
  hint,
  autoComplete,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  autoComplete: string;
  onChange: (next: string) => void;
}) {
  const [shown, setShown] = useState(false);

  return (
    <FieldRow id={id} label={label} required error={error} hint={hint}>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={shown ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          error={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-label={shown ? "Нууц үг нуух" : "Нууц үг харах"}
          className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-btn text-ink-2 hover:bg-surface hover:text-ink"
        >
          {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </FieldRow>
  );
}
