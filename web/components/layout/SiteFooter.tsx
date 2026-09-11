import Link from "next/link";

const COLUMNS = [
  {
    title: "АНГИЛАЛ",
    links: [
      { label: "Хувцас", href: "/c/huvtsas" },
      { label: "Гоо сайхан", href: "/c/goo-saihan" },
      { label: "Гэр ахуй", href: "/c/ger-ahui" },
      { label: "Цахилгаан бараа", href: "/c/tsahilgaan" },
      { label: "Бусад", href: "/c/busad" },
    ],
  },
  {
    title: "ТУСЛАМЖ",
    links: [
      { label: "Түгээмэл асуултууд", href: "/tuslamj" },
      { label: "Захиалга хянах", href: "/tuslamj/zahialga" },
      { label: "Буцаалт, солилцоо", href: "/tuslamj/butsaalt" },
      { label: "Холбоо барих", href: "/holboo-barih" },
    ],
  },
  {
    title: "ХҮРГЭЛТ, ТӨЛБӨР",
    links: [
      { label: "Хүргэлтийн нөхцөл", href: "/tuslamj/hurgelt" },
      { label: "Төлбөрийн арга", href: "/tuslamj/tolbor" },
      { label: "Бөөний худалдаа", href: "/booniy-hudaldaa" },
      { label: "Баталгаат хугацаа", href: "/tuslamj/batalgaa" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink text-white lg:mt-24">
      <div className="container-uds grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-5 lg:py-14">
        <div className="lg:pr-8">
          <span className="block text-[20px] font-extrabold tracking-[0.14em]">
            UDSHIJAN
          </span>
          <span className="mt-1 block text-[9px] tracking-[0.42em] text-white/50">
            ОНЛАЙН ДЭЛГҮҮР
          </span>
          <p className="mt-5 text-body text-white/70">
            Өдөр тутмын хэрэгцээт бүхнийг нэг дороос. 10,000-с дээш нэр төрлийн
            бараа, 24–48 цагийн хүргэлт.
          </p>
          <div className="mt-5 flex gap-2">
            <SocialLink label="Facebook">f</SocialLink>
            <SocialLink label="Instagram">ig</SocialLink>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="text-caption font-bold tracking-[0.12em] text-white/50">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-body text-white/80 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-caption font-bold tracking-[0.12em] text-white/50">
            ХОЛБОО БАРИХ
          </h3>
          <ul className="mt-4 space-y-2.5 text-body text-white/80">
            <li className="text-h3 text-white">7700-1234</li>
            <li>Даваа–Ням, 09:00–20:00</li>
            <li>
              <a href="mailto:info@udshijan.mn" className="hover:text-white">
                info@udshijan.mn
              </a>
            </li>
            <li>Улаанбаатар, Сүхбаатар дүүрэг, 1-р хороо</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-uds flex flex-col gap-4 py-5 text-small text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Udshijan LLC. Бүх эрх хуулиар хамгаалагдсан.</p>
          <ul className="flex flex-wrap items-center gap-2">
            {["QPay", "SocialPay", "Карт", "Шилжүүлэг"].map((p) => (
              <li
                key={p}
                className="rounded-[6px] border border-white/15 px-2.5 py-1 text-caption tracking-normal text-white/70"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href="#"
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-btn border border-white/15 text-small font-bold text-white/70 hover:border-white/40 hover:text-white"
    >
      {children}
    </a>
  );
}
