# Admin хуудас — 1-р үе шат: хэрэгжүүлэх төлөвлөгөө

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Udshijan дэлгүүрийн 17 бүтээгдэхүүнийг Postgres руу шилжүүлж, нууц
үгээр хамгаалагдсан админ хуудаснаас нэмэх/засах/устгах боломжтой болгох.

**Architecture:** DB давхарга `lib/data/products.ts` дотор нуугдана, гадагшаа
`Product` төрлийг л буцаана. Сервер талын хэрэглэгчид `await` нэмэхээс өөр
өөрчлөлтгүй. Клиент талын дөрвөн модуль (`cart`, `wishlist`, `CategoryView`,
`styleguide`) статик массиваас салж, Route Handler эсвэл prop-оор тэжээгдэнэ.
Cache Components асааж, mutation бүрийн дараа `revalidateTag(tag, "max")`
дуудна.

**Tech Stack:** Next.js 16.3.4, Postgres (Vercel Marketplace), Drizzle ORM,
Vitest, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-09-13-admin-huudas-design.md`

---

## Task 1: Postgres нөөцлөх (ЭНЭ АЖИЛ ХЭРЭГЛЭГЧИЙНХ)

**Энэ алхмыг агент хийж чадахгүй** — Marketplace сонголт, төлбөрийн
баталгаажуулалт интерактив.

- [ ] **Step 1: Хэрэглэгч Vercel дээр Postgres холбоно**

Vercel dashboard → `udshijan` project → Storage → Create Database →
Marketplace-аас Postgres (Neon) сонгоно → project-той холбоно.

- [ ] **Step 2: Env хувьсагчийн бодит нэрийг татах**

```bash
cd web && npx vercel env pull
```

- [ ] **Step 3: Ямар нэр буусныг унших**

```bash
grep -oE '^[A-Z_]+' web/.env.local | sort -u
```

Хүлээгдэж буй: `DATABASE_URL` эсвэл `POSTGRES_URL` төрлийн нэр.
**Гарсан нэрийг тэмдэглэ** — дараагийн бүх task үүнийг ашиглана.
Энэ төлөвлөгөөнд `DATABASE_URL` гэж бичсэн газар бүрийг бодит нэрээр солино.

- [ ] **Step 4: `.env.local` git-д ороогүйг батлах**

```bash
cd /Users/usukhbayar/Desktop/Projects/Udshijan && git status --short
```

Хүлээгдэж буй: `web/.env.local` гарч ирэхгүй (`web/.gitignore:34` `.env*`).

---

## Task 2: Vitest суулгах

**Files:**
- Modify: `web/package.json`
- Create: `web/vitest.config.ts`
- Create: `web/lib/data/mapper.test.ts`

- [ ] **Step 1: Суулгах**

```bash
cd web && npm i -D vitest @vitejs/plugin-react vite-tsconfig-paths
```

- [ ] **Step 2: Config үүсгэх**

```ts
// web/vitest.config.ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: { environment: "node", include: ["**/*.test.ts"] },
});
```

- [ ] **Step 3: `package.json`-д script нэмэх**

`"scripts"` дотор `"lint": "eslint"`-ийн дараа:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Runner ажиллаж байгааг батлах түр тест**

```ts
// web/lib/data/mapper.test.ts
import { describe, expect, it } from "vitest";

describe("vitest", () => {
  it("ажиллаж байна", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Ажиллуулах**

Run: `cd web && npm test`
Expected: PASS, 1 тест.

- [ ] **Step 6: Commit**

```bash
git add web/package.json web/package-lock.json web/vitest.config.ts web/lib/data/mapper.test.ts
git commit -m "Vitest суулгав"
```

---

## Task 3: Drizzle схем ба холболт

**Files:**
- Create: `web/drizzle/schema.ts`
- Create: `web/lib/db.ts`
- Create: `web/drizzle.config.ts`

- [ ] **Step 1: Суулгах**

```bash
cd web && npm i drizzle-orm postgres && npm i -D drizzle-kit
```

- [ ] **Step 2: Схем бичих**

```ts
// web/drizzle/schema.ts
import {
  integer,
  jsonb,
  pgTable,
  real,
  text,
} from "drizzle-orm/pg-core";
import type {
  ColorOption,
  ProductBadge,
  SizeOption,
  WholesaleTier,
} from "@/lib/data/types";

export const products = pgTable("products", {
  slug: text("slug").primaryKey(),
  sku: text("sku").notNull(),
  brand: text("brand").notNull(),
  title: text("title").notNull(),
  titleFull: text("title_full"),
  category: text("category").notNull(),
  subcategory: text("subcategory").notNull(),
  section: text("section"),
  price: integer("price").notNull(),
  compareAt: integer("compare_at"),
  rating: real("rating").notNull(),
  reviewCount: integer("review_count").notNull(),
  soldCount: integer("sold_count"),
  stock: integer("stock").notNull(),
  imageLabel: text("image_label").notNull(),
  imageCount: integer("image_count").notNull(),
  description: text("description").notNull(),
  colors: jsonb("colors").$type<ColorOption[]>().notNull(),
  sizes: jsonb("sizes").$type<SizeOption[]>().notNull(),
  wholesale: jsonb("wholesale").$type<{
    tiers: WholesaleTier[];
    minOrder: number;
  } | null>(),
  specs: jsonb("specs").$type<{ label: string; value: string }[]>().notNull(),
  badges: jsonb("badges").$type<ProductBadge[] | null>(),
  featured: jsonb("featured").$type<("bestseller" | "new")[] | null>(),
  descriptionNotes: jsonb("description_notes").$type<string[] | null>(),
});

export type ProductRow = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;
```

- [ ] **Step 3: Холболт**

```ts
// web/lib/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/drizzle/schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL тохируулаагүй байна");

const client = postgres(url, { prepare: false });

export const db = drizzle(client, { schema });
```

- [ ] **Step 4: drizzle-kit config**

```ts
// web/drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config;
```

- [ ] **Step 5: Хүснэгт үүсгэх**

```bash
cd web && npx drizzle-kit push
```

Expected: `products` хүснэгт үүссэн гэсэн мэдээлэл.

- [ ] **Step 6: Commit**

```bash
git add web/drizzle web/lib/db.ts web/drizzle.config.ts web/package.json web/package-lock.json
git commit -m "Drizzle схем ба Postgres холболт"
```

---

## Task 4: Mapper — DB мөр → Product (TDD)

Энэ бол гэрээний хил. `stock === 0` дүрэм энд хэрэгжинэ.

**Files:**
- Create: `web/lib/data/mapper.ts`
- Modify: `web/lib/data/mapper.test.ts`

- [ ] **Step 1: Унадаг тест бичих**

`web/lib/data/mapper.test.ts`-ийн агуулгыг бүхэлд нь солино:

```ts
import { describe, expect, it } from "vitest";
import { rowToProduct } from "./mapper";
import type { ProductRow } from "@/drizzle/schema";

const baseRow: ProductRow = {
  slug: "test-bar",
  sku: "UDS-T-1",
  brand: "UDS Basic",
  title: "Тест бараа",
  titleFull: null,
  category: "huvtsas",
  subcategory: "futbolk",
  section: "eregtei",
  price: 39900,
  compareAt: null,
  rating: 4.5,
  reviewCount: 10,
  soldCount: null,
  stock: 5,
  imageLabel: "футболк",
  imageCount: 3,
  description: "Тайлбар",
  colors: [{ name: "Хар", hex: "#17171A" }],
  sizes: [
    { label: "S", inStock: true },
    { label: "M", inStock: false },
  ],
  wholesale: null,
  specs: [{ label: "Брэнд", value: "UDS Basic" }],
  badges: null,
  featured: null,
  descriptionNotes: null,
};

describe("rowToProduct", () => {
  it("null утгуудыг undefined болгож Product хэлбэрт оруулна", () => {
    const product = rowToProduct(baseRow);

    expect(product.slug).toBe("test-bar");
    expect(product.titleFull).toBeUndefined();
    expect(product.compareAt).toBeUndefined();
    expect(product.wholesale).toBeUndefined();
    expect(product.badges).toBeUndefined();
  });

  it("stock > 0 үед sizes.inStock-ийг хэвээр үлдээнэ", () => {
    const product = rowToProduct({ ...baseRow, stock: 5 });

    expect(product.sizes).toEqual([
      { label: "S", inStock: true },
      { label: "M", inStock: false },
    ]);
  });

  it("stock === 0 үед бүх size-ийг дууссан болгоно", () => {
    const product = rowToProduct({ ...baseRow, stock: 0 });

    expect(product.sizes.every((s) => s.inStock === false)).toBe(true);
  });

  it("section-ийг Product-ийн нарийн төрөл рүү хөрвүүлнэ", () => {
    expect(rowToProduct({ ...baseRow, section: "emegtei" }).section).toBe(
      "emegtei",
    );
    expect(rowToProduct({ ...baseRow, section: null }).section).toBeNull();
  });
});
```

- [ ] **Step 2: Тест унаж байгааг батлах**

Run: `cd web && npm test`
Expected: FAIL — `Cannot find module './mapper'`.

- [ ] **Step 3: Mapper бичих**

```ts
// web/lib/data/mapper.ts
import type { ProductRow } from "@/drizzle/schema";
import type { Product } from "./types";

/** DB-ийн NULL → Product-ийн undefined */
function opt<T>(value: T | null): T | undefined {
  return value === null ? undefined : value;
}

/**
 * DB мөрийг Product гэрээ рүү хөрвүүлнэ.
 *
 * stock эрх мэдэлтэй: stock === 0 бол бүх хэмжээ дууссан гэж үзнэ.
 * Ингэснээр DB-д зөрүүтэй JSON байсан ч дэлгүүр буруу үлдэгдэл харуулахгүй.
 */
export function rowToProduct(row: ProductRow): Product {
  const sizes =
    row.stock === 0
      ? row.sizes.map((s) => ({ ...s, inStock: false }))
      : row.sizes;

  return {
    slug: row.slug,
    sku: row.sku,
    brand: row.brand,
    title: row.title,
    titleFull: opt(row.titleFull),
    category: row.category,
    subcategory: row.subcategory,
    section: row.section as Product["section"],
    price: row.price,
    compareAt: opt(row.compareAt),
    rating: row.rating,
    reviewCount: row.reviewCount,
    soldCount: opt(row.soldCount),
    colors: row.colors,
    sizes,
    stock: row.stock,
    wholesale: opt(row.wholesale),
    imageLabel: row.imageLabel,
    imageCount: row.imageCount,
    description: row.description,
    descriptionNotes: opt(row.descriptionNotes),
    specs: row.specs,
    badges: opt(row.badges),
    featured: opt(row.featured),
  };
}
```

- [ ] **Step 4: Тест өнгөрч байгааг батлах**

Run: `cd web && npm test`
Expected: PASS, 4 тест.

- [ ] **Step 5: Commit**

```bash
git add web/lib/data/mapper.ts web/lib/data/mapper.test.ts
git commit -m "Mapper: DB мөр → Product, stock эрх мэдэлтэй дүрэмтэй"
```

---

## Task 5: Seed script — 17 бүтээгдэхүүнийг DB рүү

**Files:**
- Create: `web/drizzle/seed.ts`
- Create: `web/lib/data/products.seed.ts` (одоогийн массивын хуулбар)

- [ ] **Step 1: Одоогийн массивыг тусад нь хуулах**

```bash
cd web && cp lib/data/products.ts lib/data/products.seed.ts
```

Дараа нь `lib/data/products.seed.ts`-ээс `productBySlug`, `productsByFeature`,
`relatedProducts` гурван функцийг устгана. Зөвхөн `export const products` болон
түүний тусламжийн тогтмолууд (`CLOTHING_SIZES`, `BLACK`, `WHITE`, `BLUE`,
`BROWN`, `GREEN`, `RED`) үлдэнэ.

- [ ] **Step 2: Seed script бичих**

```ts
// web/drizzle/seed.ts
import { db } from "@/lib/db";
import { products as table } from "./schema";
import { products as seedData } from "@/lib/data/products.seed";

async function main() {
  const rows = seedData.map((p) => ({
    slug: p.slug,
    sku: p.sku,
    brand: p.brand,
    title: p.title,
    titleFull: p.titleFull ?? null,
    category: p.category,
    subcategory: p.subcategory,
    section: p.section ?? null,
    price: p.price,
    compareAt: p.compareAt ?? null,
    rating: p.rating,
    reviewCount: p.reviewCount,
    soldCount: p.soldCount ?? null,
    stock: p.stock,
    imageLabel: p.imageLabel,
    imageCount: p.imageCount,
    description: p.description,
    colors: p.colors,
    sizes: p.sizes,
    wholesale: p.wholesale ?? null,
    specs: p.specs,
    badges: p.badges ?? null,
    featured: p.featured ?? null,
    descriptionNotes: p.descriptionNotes ?? null,
  }));

  await db.insert(table).values(rows).onConflictDoNothing();
  console.log(`${rows.length} бүтээгдэхүүн орууллаа`);
  process.exit(0);
}

main();
```

- [ ] **Step 3: `package.json`-д script нэмэх**

```json
"seed": "npx tsx drizzle/seed.ts"
```

- [ ] **Step 4: tsx суулгаад ажиллуулах**

```bash
cd web && npm i -D tsx && npm run seed
```

Expected: `17 бүтээгдэхүүн орууллаа`

- [ ] **Step 5: DB дотор байгааг батлах**

```bash
cd web && npx drizzle-kit studio
```

Эсвэл psql-ээр: `SELECT count(*) FROM products;` → `17`

- [ ] **Step 6: Commit**

```bash
git add web/drizzle/seed.ts web/lib/data/products.seed.ts web/package.json web/package-lock.json
git commit -m "Seed: одоогийн 17 бүтээгдэхүүнийг DB рүү"
```

---

## Task 6: `lib/data/products.ts`-ийг DB рүү шилжүүлэх

**Files:**
- Modify: `web/lib/data/products.ts` (бүхэлд нь солино)

- [ ] **Step 1: Файлыг бүхэлд нь солих**

```ts
// web/lib/data/products.ts
import { asc, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { products as table } from "@/drizzle/schema";
import { rowToProduct } from "./mapper";
import type { Product } from "./types";

/** Бүх бүтээгдэхүүн — slug-аар эрэмбэлсэн, тогтвортой дараалалтай */
export async function allProducts(): Promise<Product[]> {
  const rows = await db.select().from(table).orderBy(asc(table.slug));
  return rows.map(rowToProduct);
}

export async function allProductSlugs(): Promise<string[]> {
  const rows = await db
    .select({ slug: table.slug })
    .from(table)
    .orderBy(asc(table.slug));
  return rows.map((r) => r.slug);
}

export async function productBySlug(
  slug: string,
): Promise<Product | undefined> {
  const rows = await db.select().from(table).where(inArray(table.slug, [slug]));
  return rows[0] ? rowToProduct(rows[0]) : undefined;
}

export async function productsBySlugs(slugs: string[]): Promise<Product[]> {
  if (slugs.length === 0) return [];
  const rows = await db.select().from(table).where(inArray(table.slug, slugs));
  return rows.map(rowToProduct);
}

export async function productsByFeature(
  tag: "bestseller" | "new",
): Promise<Product[]> {
  const all = await allProducts();
  return all.filter((p) => p.featured?.includes(tag));
}

/**
 * PDP-ийн "Ижил төрлийн бараа" — ижил хүйс/ангилал эхэлж, дараа нь бусад.
 * Эрэмбэлэх логик шилжилтийн өмнөхтэй яг ижил.
 */
export async function relatedProducts(
  product: Product,
  limit = 5,
): Promise<Product[]> {
  const all = await allProducts();

  const score = (p: Product) =>
    (p.category === product.category ? 4 : 0) +
    (p.section && p.section === product.section ? 2 : 0) +
    (p.subcategory === product.subcategory ? 1 : 0);

  return all
    .filter((p) => p.slug !== product.slug)
    .sort((a, b) => score(b) - score(a) || b.reviewCount - a.reviewCount)
    .slice(0, limit);
}
```

- [ ] **Step 2: Ямар файлууд эвдэрснийг харах**

```bash
cd web && npx tsc --noEmit 2>&1 | head -40
```

Expected: `app/page.tsx`, `app/hailt/page.tsx`, `app/booniy-hudaldaa/page.tsx`,
`app/p/[slug]/page.tsx`, `lib/search.ts`, `components/shop/CategoryView.tsx`,
`lib/cart.ts`, `lib/wishlist.ts`, `app/styleguide/page.tsx` дээр алдаа.

Энэ жагсаалт хүлээгдэж буй зүйл — Task 7-13 тус бүрийг засна.

- [ ] **Step 3: Commit (эвдэрсэн төлөвтэй, дараагийн task-ууд засна)**

```bash
git add web/lib/data/products.ts
git commit -m "products.ts DB рүү шилжив (импортлогчид түр эвдэрсэн)"
```

---

## Task 7: `lib/search.ts`-ийг цэвэр функц болгох

**Files:**
- Modify: `web/lib/search.ts:2` болон `:47`
- Modify: `web/app/hailt/page.tsx`
- Create: `web/lib/search.test.ts`

- [ ] **Step 1: Унадаг тест бичих**

```ts
// web/lib/search.test.ts
import { describe, expect, it } from "vitest";
import { searchProducts } from "./search";
import type { Product } from "./data/types";

const sample = [
  {
    slug: "a",
    sku: "1",
    brand: "UDS Basic",
    title: "Эрэгтэй хөвөн футболк",
    category: "huvtsas",
    subcategory: "futbolk",
    price: 1,
    rating: 5,
    reviewCount: 1,
    colors: [],
    sizes: [],
    stock: 1,
    imageLabel: "футболк",
    imageCount: 1,
    description: "",
    specs: [],
  },
] as unknown as Product[];

describe("searchProducts", () => {
  it("жагсаалтыг параметрээр авч хайна", () => {
    expect(searchProducts(sample, "футболк").map((p) => p.slug)).toEqual(["a"]);
  });

  it("илэрцгүй үед хоосон буцаана", () => {
    expect(searchProducts(sample, "гутал")).toEqual([]);
  });
});
```

- [ ] **Step 2: Тест унаж байгааг батлах**

Run: `cd web && npm test`
Expected: FAIL — `searchProducts` 1 аргумент хүлээж байна.

- [ ] **Step 3: `lib/search.ts` засах**

`:2`-ийн `import { products } from "./data/products";` мөрийг **устгана**.

`:47`-ийн гарын үсгийг солино:

```ts
export function searchProducts(products: Product[], query: string): Product[] {
```

Функцийн бие дотор `products` гэж ашиглаж байсан газар өөрчлөгдөхгүй — одоо
параметрээс ирнэ.

- [ ] **Step 4: Тест өнгөрөхийг батлах**

Run: `cd web && npm test`
Expected: PASS.

- [ ] **Step 5: `app/hailt/page.tsx` дуудлагыг засах**

`searchProducts(query)` гэсэн дуудлагыг олж:

```ts
const all = await allProducts();
const results = searchProducts(all, query);
```

`import { productsByFeature } from "@/lib/data/products";` мөрөнд `allProducts`
нэмнэ. `productsByFeature(...)` дуудлага бүрийн өмнө `await` тавина.

- [ ] **Step 6: Commit**

```bash
git add web/lib/search.ts web/lib/search.test.ts web/app/hailt/page.tsx
git commit -m "searchProducts цэвэр функц болов"
```

---

## Task 8: Сервер талын хуудсуудад `await` нэмэх

**Files:**
- Modify: `web/app/page.tsx`
- Modify: `web/app/booniy-hudaldaa/page.tsx`
- Modify: `web/app/p/[slug]/page.tsx`

- [ ] **Step 1: `app/page.tsx` засах**

`productsByFeature("bestseller")` болон `productsByFeature("new")` дуудлага
бүрийн өмнө `await` нэмнэ. Хуудас аль хэдийн `async` эсэхийг шалгаж, биш бол
`export default async function` болгоно.

- [ ] **Step 2: `app/booniy-hudaldaa/page.tsx` засах**

Ижил аргаар — `products` массив ашигласан газрыг `await allProducts()`-оор
солино, импортыг `allProducts` руу өөрчилнө.

- [ ] **Step 3: `app/p/[slug]/page.tsx` засах**

Гурван газар:

```ts
export async function generateStaticParams() {
  const slugs = await allProductSlugs();
  return slugs.map((slug) => ({ slug }));
}
```

`generateMetadata` дотор: `const product = await productBySlug(slug);`

Хуудасны бие дотор: `const product = await productBySlug(slug);` болон
`const related = await relatedProducts(product);`

Импортыг шинэчилнэ: `import { allProductSlugs, productBySlug, relatedProducts } from "@/lib/data/products";`

- [ ] **Step 4: Төрөл шалгах**

```bash
cd web && npx tsc --noEmit 2>&1 | grep -E "app/page|booniy|app/p/" || echo "эдгээр файлууд цэвэр"
```

Expected: `эдгээр файлууд цэвэр`

- [ ] **Step 5: Commit**

```bash
git add web/app/page.tsx web/app/booniy-hudaldaa/page.tsx "web/app/p/[slug]/page.tsx"
git commit -m "Сервер талын хуудсууд async products руу шилжив"
```

---

## Task 9: Route Handler — клиент store-д зориулсан

**Files:**
- Create: `web/app/api/products/route.ts`
- Create: `web/app/api/products/route.test.ts`

- [ ] **Step 1: Унадаг тест бичих**

```ts
// web/app/api/products/route.test.ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/data/products", () => ({
  productsBySlugs: async (slugs: string[]) =>
    slugs.map((slug) => ({ slug, title: `Бараа ${slug}` })),
}));

const { GET } = await import("./route");

describe("GET /api/products", () => {
  it("slugs параметрээр хүссэн барааг буцаана", async () => {
    const res = await GET(
      new Request("http://localhost/api/products?slugs=a,b"),
    );
    const body = await res.json();

    expect(body.map((p: { slug: string }) => p.slug)).toEqual(["a", "b"]);
  });

  it("slugs байхгүй бол хоосон массив буцаана", async () => {
    const res = await GET(new Request("http://localhost/api/products"));

    expect(await res.json()).toEqual([]);
  });
});
```

- [ ] **Step 2: Тест унаж байгааг батлах**

Run: `cd web && npm test`
Expected: FAIL — `./route` модуль алга.

- [ ] **Step 3: Route Handler бичих**

```ts
// web/app/api/products/route.ts
import { productsBySlugs } from "@/lib/data/products";

/** Клиент талын сагс/хүслийн store бүтээгдэхүүнээ энд хандаж resolve хийнэ */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("slugs");
  const slugs = (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return Response.json(await productsBySlugs(slugs));
}
```

- [ ] **Step 4: Тест өнгөрөхийг батлах**

Run: `cd web && npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/app/api/products
git commit -m "Route Handler: slug-аар Product[] буцаана"
```

---

## Task 10: `lib/cart.ts` store-ыг resolved cache-тэй болгох

Хамгийн нарийн task. `localStorage`-д хадгалах өгөгдөл **өөрчлөгдөхгүй** —
зөвхөн бүтээгдэхүүн resolve хийх арга өөрчлөгдөнө.

**Files:**
- Modify: `web/lib/cart.ts:4` (импорт), `:153-169` (resolved useMemo)

- [ ] **Step 1: Импортыг солих**

`:4`-ийн `import { productBySlug } from "./data/products";` мөрийг устгаж,
оронд нь дээд талд нэмнэ:

```ts
import { useEffect, useState } from "react";
```

(`useCallback`, `useMemo`, `useSyncExternalStore` аль хэдийн импортлогдсон —
тэдгээрийг хэвээр үлдээнэ.)

- [ ] **Step 2: Cache hook нэмэх**

`useCart` функцийн дээр шинэ hook нэмнэ:

```ts
/**
 * Сагс/хүслийн жагсаалтад буй slug-уудын Product мэдээллийг сервертээс татаж
 * кэшэлнэ. localStorage зөвхөн slug хадгалдаг тул энэ давхарга шаардлагатай.
 */
function useProductCache(slugs: string[]): Map<string, Product> {
  const [cache, setCache] = useState<Map<string, Product>>(new Map());
  const key = slugs.slice().sort().join(",");

  useEffect(() => {
    const wanted = key ? key.split(",") : [];
    if (wanted.length === 0) {
      setCache(new Map());
      return;
    }

    let cancelled = false;
    fetch(`/api/products?slugs=${encodeURIComponent(wanted.join(","))}`)
      .then((r) => r.json() as Promise<Product[]>)
      .then((list) => {
        if (cancelled) return;
        setCache(new Map(list.map((p) => [p.slug, p])));
      })
      .catch(() => {
        if (!cancelled) setCache(new Map());
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return cache;
}
```

- [ ] **Step 3: `resolved` useMemo-г cache-ийн эсрэг ажиллуулах**

`:153`-аас эхлэх `resolved` useMemo-г солино:

```ts
const productCache = useProductCache(data.lines.map((l) => l.slug));

const resolved = useMemo<ResolvedLine[]>(
  () =>
    data.lines.flatMap((line) => {
      const product = productCache.get(line.slug);
      if (!product) return [];
      return [
        {
          ...line,
          product,
          lineTotal: product.price * line.qty,
          lineSavings: product.compareAt
            ? (product.compareAt - product.price) * line.qty
            : 0,
        },
      ];
    }),
  [data.lines, productCache],
);
```

- [ ] **Step 4: Ачаалж буй төлөвийг гаргах**

`useCart`-ийн буцаах объектод нэмнэ:

```ts
loading: data.lines.length > 0 && productCache.size === 0,
```

- [ ] **Step 5: Төрөл шалгах**

```bash
cd web && npx tsc --noEmit 2>&1 | grep "lib/cart" || echo "cart.ts цэвэр"
```

Expected: `cart.ts цэвэр`

- [ ] **Step 6: Commit**

```bash
git add web/lib/cart.ts
git commit -m "Сагсны store: бүтээгдэхүүнийг Route Handler-ээс resolve хийнэ"
```

---

## Task 11: `lib/wishlist.ts` store-ыг ижил аргаар шилжүүлэх

**Files:**
- Modify: `web/lib/wishlist.ts:4` (импорт), `:82-89` (resolved useMemo)
- Create: `web/lib/product-cache.ts`

- [ ] **Step 1: Cache hook-ыг хуваалцах модуль руу гаргах**

Task 10-д `cart.ts` дотор бичсэн `useProductCache`-ийг шинэ файл руу зөөнө:

```ts
// web/lib/product-cache.ts
"use client";

import { useEffect, useState } from "react";
import type { Product } from "./data/types";

/**
 * Сагс/хүслийн жагсаалтад буй slug-уудын Product мэдээллийг сервертээс татаж
 * кэшэлнэ. localStorage зөвхөн slug хадгалдаг тул энэ давхарга шаардлагатай.
 */
export function useProductCache(slugs: string[]): Map<string, Product> {
  const [cache, setCache] = useState<Map<string, Product>>(new Map());
  const key = slugs.slice().sort().join(",");

  useEffect(() => {
    const wanted = key ? key.split(",") : [];
    if (wanted.length === 0) {
      setCache(new Map());
      return;
    }

    let cancelled = false;
    fetch(`/api/products?slugs=${encodeURIComponent(wanted.join(","))}`)
      .then((r) => r.json() as Promise<Product[]>)
      .then((list) => {
        if (cancelled) return;
        setCache(new Map(list.map((p) => [p.slug, p])));
      })
      .catch(() => {
        if (!cancelled) setCache(new Map());
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  return cache;
}
```

`lib/cart.ts`-ээс локал хувилбарыг устгаж импортоор солино:

```ts
import { useProductCache } from "./product-cache";
```

- [ ] **Step 2: `lib/wishlist.ts` засах**

`:4`-ийн `import { productBySlug } from "./data/products";`-ийг солино:

```ts
import { useProductCache } from "./product-cache";
```

`:82`-ийн `resolved` useMemo-г солино:

```ts
const productCache = useProductCache(slugs);

const resolved = useMemo<Product[]>(
  () => slugs.flatMap((slug) => {
    const product = productCache.get(slug);
    return product ? [product] : [];
  }),
  [slugs, productCache],
);
```

- [ ] **Step 3: Төрөл шалгах**

```bash
cd web && npx tsc --noEmit 2>&1 | grep -E "wishlist|cart" || echo "store-ууд цэвэр"
```

Expected: `store-ууд цэвэр`

- [ ] **Step 4: Commit**

```bash
git add web/lib/wishlist.ts web/lib/cart.ts web/lib/product-cache.ts
git commit -m "Хүслийн жагсаалт ижил cache давхарга руу шилжив"
```

---

## Task 12: `CategoryView`-д бүтээгдэхүүнийг prop-оор дамжуулах

**Files:**
- Modify: `web/components/shop/CategoryView.tsx:5`
- Modify: `web/app/c/[slug]/page.tsx`

- [ ] **Step 1: `CategoryView`-ийн импортыг устгаж prop болгох**

`:5`-ийн `import { products as allProducts } from "@/lib/data/products";`
мөрийг устгана.

Компонентын props төрөлд нэмнэ:

```ts
products: Product[];
```

Компонентын параметрт `products` нэмж, дотор нь `allProducts` гэж ашиглаж
байсан газрыг `products` болгоно. `Product` төрлийн импортыг нэмнэ:

```ts
import type { Product } from "@/lib/data/types";
```

- [ ] **Step 2: Эцэг хуудсанд дамжуулах**

`app/c/[slug]/page.tsx` дотор:

```ts
import { allProducts } from "@/lib/data/products";
```

`<CategoryView ... />` дуудлагад нэмнэ:

```tsx
<CategoryView
  category={category}
  section={section}
  title={title}
  products={await allProducts()}
/>
```

- [ ] **Step 3: Төрөл шалгах**

```bash
cd web && npx tsc --noEmit 2>&1 | grep -E "CategoryView|app/c/" || echo "ангилал цэвэр"
```

Expected: `ангилал цэвэр`

- [ ] **Step 4: Commit**

```bash
git add web/components/shop/CategoryView.tsx "web/app/c/[slug]/page.tsx"
git commit -m "CategoryView бүтээгдэхүүнээ prop-оор авна"
```

---

## Task 13: `app/styleguide/page.tsx` засах

Энэ бол зөвхөн хөгжүүлэлтийн хуудас. 4 жишээ бүтээгдэхүүн л хэрэгтэй
(`:105-108`).

**Files:**
- Modify: `web/app/styleguide/page.tsx`
- Create: `web/app/styleguide/StyleguideContent.tsx`

- [ ] **Step 1: Одоогийн клиент агуулгыг тусад нь гаргах**

`app/styleguide/page.tsx`-ийн бүх агуулгыг `StyleguideContent.tsx` руу зөөнө.
Дээд талд нь `"use client"` үлдээнэ. Компонентын нэрийг `StyleguideContent`
болгож, props нэмнэ:

```ts
export function StyleguideContent({ samples }: { samples: Product[] }) {
```

`:36`-ийн `import { products } from "@/lib/data/products";` устгана.
`:105-108`-ийн `products[0]`…`products[3]`-ийг `samples[0]`…`samples[3]`
болгоно.

- [ ] **Step 2: Хуудсыг сервер компонент болгох**

```tsx
// web/app/styleguide/page.tsx
import { allProducts } from "@/lib/data/products";
import { StyleguideContent } from "./StyleguideContent";

export default async function StyleguidePage() {
  const samples = (await allProducts()).slice(0, 4);
  return <StyleguideContent samples={samples} />;
}
```

- [ ] **Step 3: Бүх төрөл цэвэр болсныг батлах**

```bash
cd web && npx tsc --noEmit
```

Expected: алдаагүй, гаралт хоосон.

- [ ] **Step 4: Commit**

```bash
git add web/app/styleguide
git commit -m "Styleguide сервер компонент болж жишээ барааг prop-оор авна"
```

---

## Task 14: Cache Components асаах

**Files:**
- Modify: `web/next.config.ts`
- Modify: `web/lib/data/products.ts`
- Modify: `web/app/p/[slug]/page.tsx`
- Modify: `web/app/c/[slug]/page.tsx`
- Modify: `web/app/tuslamj/[slug]/page.tsx`

- [ ] **Step 1: Флаг асаах**

```ts
// web/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
};

export default nextConfig;
```

- [ ] **Step 2: Уншилтын функцуудыг кэшлэх**

`lib/data/products.ts`-ийн `allProducts` болон `productBySlug`-д нэмнэ:

```ts
import { cacheTag } from "next/cache";

export async function allProducts(): Promise<Product[]> {
  "use cache";
  cacheTag("products");
  const rows = await db.select().from(table).orderBy(asc(table.slug));
  return rows.map(rowToProduct);
}

export async function productBySlug(
  slug: string,
): Promise<Product | undefined> {
  "use cache";
  cacheTag("products");
  cacheTag("product-" + slug);
  const rows = await db.select().from(table).where(inArray(table.slug, [slug]));
  return rows[0] ? rowToProduct(rows[0]) : undefined;
}
```

`productsBySlugs` нь Route Handler-т ашиглагдана — кэшлэхгүй.

- [ ] **Step 3: Build ажиллуулж validation алдаануудыг харах**

```bash
cd web && npm run build 2>&1 | tail -40
```

Expected: `app/p/[slug]`, `app/c/[slug]`, `app/tuslamj/[slug]` дээр
instant-navigation validation алдаа.

- [ ] **Step 4: `app/p/[slug]/page.tsx`-д Suspense хил тавих**

Хуудсыг хоёр хэсэгт хуваана — статик бүрхүүл, дараа нь runtime агуулга:

```tsx
import { Suspense } from "react";

async function ProductContent({ slug }: { slug: string }) {
  const product = await productBySlug(slug);
  if (!product) notFound();

  const category = categoryBySlug(product.category);
  const related = await relatedProducts(product);

  return (
    <>
      <ProductDetail
        product={product}
        categoryName={category?.name ?? ""}
        categorySlug={product.category}
      />
      <ProductGrid products={related} />
    </>
  );
}

export default async function ProductPage(props: PageProps<"/p/[slug]">) {
  const { slug } = await props.params;

  return (
    <Shell mobileTitle="Бүтээгдэхүүн" mobileActions="cart" bottomBarSpace>
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductContent slug={slug} />
      </Suspense>
    </Shell>
  );
}
```

`ProductDetailSkeleton`-ийг шинээр үүсгэнэ:

```tsx
// web/components/shop/ProductDetailSkeleton.tsx
import { Placeholder } from "@/components/Placeholder";

/** PDP-ийн runtime агуулгыг хүлээх үеийн бүрхүүл */
export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-8 py-6 md:grid-cols-2">
      <Placeholder ratio="3/4" bare />
      <div className="flex flex-col gap-3">
        <div className="h-7 w-3/4 rounded bg-line" />
        <div className="h-5 w-1/3 rounded bg-line" />
        <div className="h-10 w-1/2 rounded bg-line" />
        <div className="mt-4 h-24 w-full rounded bg-line" />
      </div>
    </div>
  );
}
```

`app/p/[slug]/page.tsx`-д импортыг нэмнэ:

```ts
import { ProductDetailSkeleton } from "@/components/shop/ProductDetailSkeleton";
```

**Энэ Suspense хил яагаад чухал вэ:** админ build-ийн дараа нэмсэн
бүтээгдэхүүний slug нь `generateStaticParams`-ийн жагсаалтад байхгүй тул
runtime param болно. Хил байхгүй бол шинэ бүтээгдэхүүн эвдэрнэ.

- [ ] **Step 5: `app/c/[slug]` болон `app/tuslamj/[slug]`-д ижил зарчмаар засах**

`app/c/[slug]/page.tsx` аль хэдийн `<Suspense>` ашигладаг — `await
allProducts()` дуудлагыг Suspense хилийн **дотор** байрлуулна, өөрөөр хэлбэл
шинэ `CategoryContent` компонент дотор.

`app/tuslamj/[slug]/page.tsx`-ийн өгөгдөл код дотор хэвээр (2-р үе шат хүртэл)
тул `generateStaticParams` өөрчлөгдөхгүй, зөвхөн validation алдаа гарвал засна.

- [ ] **Step 6: Build цэвэр өнгөрөхийг батлах**

```bash
cd web && npm run build 2>&1 | tail -25
```

Expected: `✓ Compiled successfully`, алдаагүй.

- [ ] **Step 7: Commit**

```bash
git add web/next.config.ts web/lib/data/products.ts web/app web/components
git commit -m "Cache Components асаав, Suspense хилүүдийг байрлуулав"
```

---

## Task 15: Админы session cookie (TDD)

**Files:**
- Create: `web/lib/admin/auth.ts`
- Create: `web/lib/admin/auth.test.ts`

- [ ] **Step 1: Унадаг тест бичих**

```ts
// web/lib/admin/auth.test.ts
import { describe, expect, it } from "vitest";
import { signSession, verifySession } from "./auth";

const SECRET = "тест-нууц-түлхүүр-хангалттай-урт-утга-2026";

describe("session гарын үсэг", () => {
  it("өөрийн зурсан гарын үсгийг хүлээн авна", () => {
    const token = signSession(SECRET, Date.now() + 60_000);
    expect(verifySession(SECRET, token)).toBe(true);
  });

  it("өөр түлхүүрээр зурсныг татгалзана", () => {
    const token = signSession("өөр-түлхүүр", Date.now() + 60_000);
    expect(verifySession(SECRET, token)).toBe(false);
  });

  it("гарын үсгийг өөрчилсөн токеныг татгалзана", () => {
    const token = signSession(SECRET, Date.now() + 60_000);
    const tampered = token.slice(0, -1) + (token.endsWith("a") ? "b" : "a");
    expect(verifySession(SECRET, tampered)).toBe(false);
  });

  it("хугацаа нь дууссан токеныг татгалзана", () => {
    const token = signSession(SECRET, Date.now() - 1000);
    expect(verifySession(SECRET, token)).toBe(false);
  });

  it("хог утгыг татгалзана", () => {
    expect(verifySession(SECRET, "хог")).toBe(false);
    expect(verifySession(SECRET, "")).toBe(false);
  });
});
```

- [ ] **Step 2: Тест унаж байгааг батлах**

Run: `cd web && npm test`
Expected: FAIL — `./auth` модуль алга.

- [ ] **Step 3: Хэрэгжүүлэх**

```ts
// web/lib/admin/auth.ts
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "udshijan_admin";

function sign(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** `exp.signature` хэлбэртэй токен. Нууц үг өөрөө хэзээ ч энд орохгүй. */
export function signSession(secret: string, expiresAt: number): string {
  const payload = String(expiresAt);
  return `${payload}.${sign(secret, payload)}`;
}

export function verifySession(secret: string, token: string): boolean {
  const dot = token.indexOf(".");
  if (dot <= 0) return false;

  const payload = token.slice(0, dot);
  const provided = token.slice(dot + 1);

  const expected = sign(secret, payload);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}
```

- [ ] **Step 4: Тест өнгөрөхийг батлах**

Run: `cd web && npm test`
Expected: PASS, 5 тест.

- [ ] **Step 5: Commit**

```bash
git add web/lib/admin/auth.ts web/lib/admin/auth.test.ts
git commit -m "Админы HMAC session токен"
```

---

## Task 16: Session уншилт ба хамгаалалт

**Files:**
- Create: `web/lib/admin/session.ts`
- Create: `web/proxy.ts`

- [ ] **Step 1: Cookie уншигч бичих**

```ts
// web/lib/admin/session.ts
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./auth";

const DAY = 24 * 60 * 60 * 1000;
export const SESSION_MAX_AGE_MS = 7 * DAY;

function secret(): string {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value) throw new Error("ADMIN_SESSION_SECRET тохируулаагүй байна");
  return value;
}

/**
 * Нэвтэрсэн эсэхийг шалгана.
 *
 * Cache Components асаалттай тул энэ функцийг `use cache` scope дотор эсвэл
 * layout-ийн дээд талд дуудаж БОЛОХГҮЙ — cookies() унших нь тэнд алдаа өгнө.
 * Server Action дотор болон Suspense хилийн доторх компонентод дуудна.
 */
export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySession(secret(), token) : false;
}

/** Server Action бүрийн эхэнд дуудна. Энэ бол жинхэнэ хамгаалалтын хил. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Нэвтрэх шаардлагатай");
}

export function sessionCookieOptions(maxAgeMs: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}
```

- [ ] **Step 2: Proxy — optimistic redirect**

```ts
// web/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/admin/auth";

/**
 * Cookie БАЙГАА эсэхийг л шалгана — гарын үсгийг шалгахгүй.
 * Энэ бол зөвхөн UX-ийн чиглүүлэлт, аюулгүй байдлын хил БИШ.
 * Жинхэнэ шалгалт Server Action бүрийн дотор явагдана.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/newterh") {
    if (!request.cookies.get(SESSION_COOKIE)) {
      return NextResponse.redirect(new URL("/admin/newterh", request.url));
    }
  }

  return NextResponse.next();
}

export const config = { matcher: "/admin/:path*" };
```

- [ ] **Step 3: Build цэвэр эсэхийг батлах**

```bash
cd web && npm run build 2>&1 | tail -15
```

Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add web/lib/admin/session.ts web/proxy.ts
git commit -m "Session уншилт ба proxy-ийн optimistic чиглүүлэлт"
```

---

## Task 17: Нэвтрэх хуудас

**Files:**
- Create: `web/app/admin/newterh/page.tsx`
- Create: `web/lib/admin/login-action.ts`

- [ ] **Step 1: Нэвтрэх Server Action**

```ts
// web/lib/admin/login-action.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, signSession } from "./auth";
import { SESSION_MAX_AGE_MS, sessionCookieOptions } from "./session";

export async function login(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !secret) return "Сервер тохируулагдаагүй байна";

  if (formData.get("password") !== password) {
    return "Нууц үг буруу байна";
  }

  const token = signSession(secret, Date.now() + SESSION_MAX_AGE_MS);
  (await cookies()).set(
    SESSION_COOKIE,
    token,
    sessionCookieOptions(SESSION_MAX_AGE_MS),
  );

  redirect("/admin");
}
```

- [ ] **Step 2: Нэвтрэх форм**

```tsx
// web/app/admin/newterh/page.tsx
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

      <form action={formAction} className="mt-6 flex flex-col gap-3">
        <Input
          type="password"
          name="password"
          placeholder="Нууц үг"
          aria-label="Нууц үг"
          error={Boolean(error)}
          required
        />
        {error ? <Alert>{error}</Alert> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Шалгаж байна…" : "Нэвтрэх"}
        </Button>
      </form>
    </main>
  );
}
```

- [ ] **Step 3: Гараар шалгах**

```bash
cd web && ADMIN_PASSWORD=test123 ADMIN_SESSION_SECRET=urt-nuuts-tulhuur-2026 npm run dev
```

`http://localhost:3000/admin/newterh` нээж буруу нууц үг оруулна → алдаа гарна.
`test123` оруулна → `/admin` руу шилжинэ.

- [ ] **Step 4: Commit**

```bash
git add web/app/admin/newterh web/lib/admin/login-action.ts
git commit -m "Админ нэвтрэх хуудас"
```

---

## Task 18: Бүтээгдэхүүний Server Actions

**Files:**
- Create: `web/lib/admin/actions.ts`
- Create: `web/lib/admin/validate.ts`
- Create: `web/lib/admin/validate.test.ts`

- [ ] **Step 1: Формын шалгалтад унадаг тест бичих**

```ts
// web/lib/admin/validate.test.ts
import { describe, expect, it } from "vitest";
import { validateProductForm } from "./validate";

const valid = {
  slug: "shine-bar",
  sku: "UDS-X-1",
  brand: "UDS Basic",
  title: "Шинэ бараа",
  category: "huvtsas",
  subcategory: "futbolk",
  price: "39900",
  stock: "10",
  imageLabel: "футболк",
  imageCount: "3",
  description: "Тайлбар",
  rating: "4.5",
  reviewCount: "10",
};

describe("validateProductForm", () => {
  it("зөв өгөгдлийг хүлээн авна", () => {
    expect(validateProductForm(valid).errors).toEqual({});
  });

  it("сөрөг үнийг татгалзана", () => {
    const { errors } = validateProductForm({ ...valid, price: "-5" });
    expect(errors.price).toBeTruthy();
  });

  it("хоосон нэрийг татгалзана", () => {
    const { errors } = validateProductForm({ ...valid, title: "  " });
    expect(errors.title).toBeTruthy();
  });

  it("буруу slug хэлбэрийг татгалзана", () => {
    const { errors } = validateProductForm({ ...valid, slug: "Буруу Slug!" });
    expect(errors.slug).toBeTruthy();
  });

  it("сөрөг үлдэгдлийг татгалзана", () => {
    const { errors } = validateProductForm({ ...valid, stock: "-1" });
    expect(errors.stock).toBeTruthy();
  });
});
```

- [ ] **Step 2: Тест унаж байгааг батлах**

Run: `cd web && npm test`
Expected: FAIL — `./validate` алга.

- [ ] **Step 3: Шалгалтыг хэрэгжүүлэх**

```ts
// web/lib/admin/validate.ts
export type ProductFormInput = Record<string, string>;
export type FormErrors = Record<string, string>;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function positiveInt(value: string): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

export function validateProductForm(input: ProductFormInput): {
  errors: FormErrors;
} {
  const errors: FormErrors = {};

  if (!SLUG_RE.test(input.slug ?? "")) {
    errors.slug = "Зөвхөн жижиг үсэг, тоо, зураас ашиглана";
  }
  for (const field of ["sku", "brand", "title", "category", "subcategory", "imageLabel", "description"]) {
    if (!(input[field] ?? "").trim()) errors[field] = "Заавал бөглөнө";
  }
  if (positiveInt(input.price ?? "") === null) {
    errors.price = "Үнэ сөрөг биш бүхэл тоо байна";
  }
  if (positiveInt(input.stock ?? "") === null) {
    errors.stock = "Үлдэгдэл сөрөг биш бүхэл тоо байна";
  }
  if (positiveInt(input.imageCount ?? "") === null) {
    errors.imageCount = "Зургийн тоо сөрөг биш бүхэл тоо байна";
  }
  if (positiveInt(input.reviewCount ?? "") === null) {
    errors.reviewCount = "Сэтгэгдлийн тоо сөрөг биш бүхэл тоо байна";
  }
  const rating = Number(input.rating);
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    errors.rating = "Үнэлгээ 0–5 хооронд байна";
  }

  return { errors };
}
```

**Хэрэгжүүлэх үед нэмэгдсэн засварууд** (`4163c04` commit-д орсон):
`positiveInt` нь `Number("") === 0` тул хоосон утгыг чимээгүй 0 болгож
байсныг зассан — одоо зөвхөн `/^\d+$/` таарсан цэвэр бүхэл тоо хүлээн авна.
`rating`-д тусдаа хоосон шалгалт нэмсэн.

**`section`-ийн шалгалт (mapper хяналтаас гарсан):** формд `section` нь чөлөөт
текст талбар бөгөөд шалгалтгүй байсан. Админ `"Eregtei"` гэж бичвэл DB-д
цэвэр хадгалагдаж, бүтээгдэхүүн `/c/huvtsas?section=eregtei` шүүлтээс чимээгүй
алга болно. `validateProductForm`-д нэмнэ:

```ts
  const section = (input.section ?? "").trim();
  if (section && section !== "eregtei" && section !== "emegtei") {
    errors.section = "Зөвхөн eregtei эсвэл emegtei байна";
  }
```

Хоосон утга зөвшөөрөгдөнө — хүйсгүй бүтээгдэхүүн байж болно. `mapper.ts` ч
мөн адил шалгадаг (давхар хамгаалалт: шууд SQL засварыг барина).

- [ ] **Step 4: Тест өнгөрөхийг батлах**

Run: `cd web && npm test`
Expected: PASS.

- [ ] **Step 5: Server Actions бичих**

```ts
// web/lib/admin/actions.ts
"use server";

import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { products as table } from "@/drizzle/schema";
import { requireAdmin } from "./session";
import { validateProductForm, type FormErrors } from "./validate";

function fields(formData: FormData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

function refresh(slug: string) {
  revalidateTag("products", "max");
  revalidateTag("product-" + slug, "max");
}

export async function saveProduct(
  _prev: FormErrors | null,
  formData: FormData,
): Promise<FormErrors | null> {
  await requireAdmin();

  const input = fields(formData);
  const { errors } = validateProductForm(input);
  if (Object.keys(errors).length > 0) return errors;

  const row = {
    slug: input.slug,
    sku: input.sku,
    brand: input.brand,
    title: input.title,
    titleFull: input.titleFull || null,
    category: input.category,
    subcategory: input.subcategory,
    section: input.section || null,
    price: Number(input.price),
    compareAt: input.compareAt ? Number(input.compareAt) : null,
    rating: Number(input.rating),
    reviewCount: Number(input.reviewCount),
    soldCount: input.soldCount ? Number(input.soldCount) : null,
    stock: Number(input.stock),
    imageLabel: input.imageLabel,
    imageCount: Number(input.imageCount),
    description: input.description,
    colors: JSON.parse(input.colors || "[]"),
    sizes: JSON.parse(input.sizes || "[]"),
    wholesale: input.wholesale ? JSON.parse(input.wholesale) : null,
    specs: JSON.parse(input.specs || "[]"),
    badges: input.badges ? JSON.parse(input.badges) : null,
    featured: input.featured ? JSON.parse(input.featured) : null,
    descriptionNotes: input.descriptionNotes
      ? JSON.parse(input.descriptionNotes)
      : null,
  };

  await db
    .insert(table)
    .values(row)
    .onConflictDoUpdate({ target: table.slug, set: row });

  refresh(row.slug);
  redirect("/admin");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const slug = String(formData.get("slug") ?? "");
  if (!slug) return;

  await db.delete(table).where(eq(table.slug, slug));
  refresh(slug);
  redirect("/admin");
}
```

- [ ] **Step 6: Commit**

```bash
git add web/lib/admin/actions.ts web/lib/admin/validate.ts web/lib/admin/validate.test.ts
git commit -m "Бүтээгдэхүүний Server Actions, эрх шалгалттай"
```

---

## Task 19: Админы жагсаалт ба засах форм

**Files:**
- Create: `web/app/admin/page.tsx`
- Create: `web/app/admin/ProductForm.tsx`
- Create: `web/app/admin/[slug]/page.tsx`
- Create: `web/app/admin/shine/page.tsx`

- [ ] **Step 1: Жагсаалтын хуудас**

```tsx
// web/app/admin/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { allProducts } from "@/lib/data/products";
import { money } from "@/lib/format";

async function ProductRows() {
  const items = await allProducts();

  return (
    <ul className="mt-6 divide-y divide-line">
      {items.map((p) => (
        <li key={p.slug} className="flex items-center justify-between py-3">
          <div>
            <Link href={`/admin/${p.slug}`} className="text-body font-medium">
              {p.title}
            </Link>
            <p className="text-small text-ink-2">
              {p.sku} · {money(p.price)} · үлдэгдэл {p.stock}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-h2">Бүтээгдэхүүн</h1>
        <Link href="/admin/shine" className="text-body text-brand">
          + Нэмэх
        </Link>
      </div>

      <Suspense fallback={<p className="mt-6 text-small text-ink-2">Ачааллаж байна…</p>}>
        <ProductRows />
      </Suspense>
    </main>
  );
}
```

- [ ] **Step 2: Засах форм (клиент компонент)**

```tsx
// web/app/admin/ProductForm.tsx
"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { saveProduct } from "@/lib/admin/actions";
import type { Product } from "@/lib/data/types";

export function ProductForm({ product }: { product?: Product }) {
  const [errors, formAction, pending] = useActionState(saveProduct, null);
  const v = product;

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <Input name="slug" defaultValue={v?.slug} placeholder="slug" error={Boolean(errors?.slug)} />
      {errors?.slug ? <p className="text-small text-danger">{errors.slug}</p> : null}

      <Input name="sku" defaultValue={v?.sku} placeholder="SKU" error={Boolean(errors?.sku)} />
      <Input name="brand" defaultValue={v?.brand} placeholder="Брэнд" error={Boolean(errors?.brand)} />
      <Input name="title" defaultValue={v?.title} placeholder="Нэр" error={Boolean(errors?.title)} />
      <Input name="titleFull" defaultValue={v?.titleFull} placeholder="Бүтэн нэр" />
      <Input name="category" defaultValue={v?.category} placeholder="Ангилал" error={Boolean(errors?.category)} />
      <Input name="subcategory" defaultValue={v?.subcategory} placeholder="Дэд ангилал" error={Boolean(errors?.subcategory)} />
      <Select name="section" defaultValue={v?.section ?? ""}>
        <option value="">— хүйсгүй —</option>
        <option value="eregtei">Эрэгтэй</option>
        <option value="emegtei">Эмэгтэй</option>
      </Select>
      <Input name="price" defaultValue={v?.price} placeholder="Үнэ" error={Boolean(errors?.price)} />
      {errors?.price ? <p className="text-small text-danger">{errors.price}</p> : null}

      <Input name="compareAt" defaultValue={v?.compareAt} placeholder="Хямдралын өмнөх үнэ" />
      <Input name="rating" defaultValue={v?.rating} placeholder="Үнэлгээ 0–5" error={Boolean(errors?.rating)} />
      <Input name="reviewCount" defaultValue={v?.reviewCount} placeholder="Сэтгэгдлийн тоо" />
      <Input name="soldCount" defaultValue={v?.soldCount} placeholder="Зарагдсан тоо" />
      <Input name="stock" defaultValue={v?.stock} placeholder="Үлдэгдэл" error={Boolean(errors?.stock)} />
      {errors?.stock ? <p className="text-small text-danger">{errors.stock}</p> : null}

      <p className="text-small text-ink-2">
        Үлдэгдэл 0 бол бүх хэмжээ дууссан гэж харагдана.
      </p>

      <Input name="imageLabel" defaultValue={v?.imageLabel} placeholder="Зургийн бичиг" />
      <Input name="imageCount" defaultValue={v?.imageCount} placeholder="Зургийн тоо" />
      <Textarea name="description" defaultValue={v?.description} placeholder="Тайлбар" />

      <Textarea name="colors" defaultValue={JSON.stringify(v?.colors ?? [], null, 2)} placeholder="colors JSON" />
      <Textarea name="sizes" defaultValue={JSON.stringify(v?.sizes ?? [], null, 2)} placeholder="sizes JSON" />
      <Textarea name="specs" defaultValue={JSON.stringify(v?.specs ?? [], null, 2)} placeholder="specs JSON" />
      <Textarea name="wholesale" defaultValue={v?.wholesale ? JSON.stringify(v.wholesale, null, 2) : ""} placeholder="wholesale JSON" />
      <Textarea name="badges" defaultValue={v?.badges ? JSON.stringify(v.badges) : ""} placeholder="badges JSON" />
      <Textarea name="featured" defaultValue={v?.featured ? JSON.stringify(v.featured) : ""} placeholder="featured JSON" />
      <Textarea name="descriptionNotes" defaultValue={v?.descriptionNotes ? JSON.stringify(v.descriptionNotes) : ""} placeholder="descriptionNotes JSON" />

      <Button type="submit" disabled={pending}>
        {pending ? "Хадгалж байна…" : "Хадгалах"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Засах/нэмэх хуудас**

```tsx
// web/app/admin/[slug]/page.tsx
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { productBySlug } from "@/lib/data/products";
import { deleteProduct } from "@/lib/admin/actions";
import { ProductForm } from "../ProductForm";

async function FormContent({ slug }: { slug: string }) {
  const product = await productBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <ProductForm product={product} />

      <form action={deleteProduct} className="mt-10 border-t border-line pt-6">
        <input type="hidden" name="slug" value={product.slug} />
        <button
          type="submit"
          className="text-small font-medium text-danger underline"
        >
          Энэ бүтээгдэхүүнийг устгах
        </button>
      </form>
    </>
  );
}

export default async function AdminProductPage(
  props: PageProps<"/admin/[slug]">,
) {
  const { slug } = await props.params;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="text-h2">Бүтээгдэхүүн засах</h1>
      <Suspense fallback={<p className="mt-6 text-small text-ink-2">Ачааллаж байна…</p>}>
        <FormContent slug={slug} />
      </Suspense>
    </main>
  );
}
```

- [ ] **Step 3b: Шинэ бүтээгдэхүүний хуудсыг ТУСДАА статик зам болгох**

`/admin/shine`-ийг `[slug]`-ийн дотор тусгай тохиолдол болгож шийдэхгүй —
тэгвэл `shine` гэсэн slug-тай бодит бүтээгдэхүүнийг засах боломжгүй болно.
Next статик сегментийг динамикаас түрүүлж сонгодог тул тусдаа файл үүсгэнэ:

```tsx
// web/app/admin/shine/page.tsx
import { ProductForm } from "../ProductForm";

export default function NewProductPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="text-h2">Шинэ бүтээгдэхүүн</h1>
      <ProductForm />
    </main>
  );
}
```

- [ ] **Step 4: Build батлах**

```bash
cd web && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully`

- [ ] **Step 5: Commit**

```bash
git add web/app/admin
git commit -m "Админы жагсаалт ба бүтээгдэхүүний форм"
```

---

## Task 20: Эцсийн шалгалт ба deploy

- [ ] **Step 1: Бүх тест**

```bash
cd web && npm test
```

Expected: бүгд PASS.

- [ ] **Step 2: Build**

```bash
cd web && npm run build
```

Expected: `✓ Compiled successfully`, алдаагүй.

- [ ] **Step 3: Vercel дээр env хувьсагч тохируулах (ХЭРЭГЛЭГЧ)**

```bash
cd web
npx vercel env add ADMIN_PASSWORD production
npx vercel env add ADMIN_SESSION_SECRET production
```

`ADMIN_SESSION_SECRET`-ийг ингэж үүсгэнэ:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

`preview` болон `development` орчинд ч ижилхэн нэмнэ. `DATABASE_URL` нь Task 1-д
интеграциар автоматаар тохируулагдсан байх ёстой — `npx vercel env ls`-ээр
батална.

- [ ] **Step 4: Push**

```bash
git push origin master
```

- [ ] **Step 5: Deploy амжилттай эсэхийг батлах**

```bash
npx vercel inspect https://udshijan.vercel.app 2>&1 | grep -E "status|url"
curl -s -o /dev/null -w "%{http_code}\n" https://udshijan.vercel.app/
```

Expected: `● Ready`, `200`

- [ ] **Step 6: Бодит гүйлгээг шалгах**

1. `https://udshijan.vercel.app/admin` нээх → нэвтрэх хуудас руу чиглүүлнэ
2. Нууц үг оруулж нэвтрэх
3. Бүтээгдэхүүн засаж үнийг өөрчлөх → хадгалах
4. `https://udshijan.vercel.app/p/<slug>` нээх → **шинэ үнэ харагдах ёстой**
5. Шинэ бүтээгдэхүүн нэмэх → түүний хуудас ажиллах ёстой (runtime param)

---

## Өөрийгөө шалгах тэмдэглэл

Spec-ийн хамрах хүрээ бүрэн хамрагдсан эсэх:

| Spec шаардлага | Task |
|---|---|
| Postgres + Drizzle | 1, 3 |
| Ганц нууц үгийн нэвтрэлт | 15, 16, 17 |
| Бүтээгдэхүүн нэмэх/засах/устгах | 18, 19 |
| Seed script | 5 |
| Cache Components | 14 |
| Клиент талын 4 модуль | 10, 11, 12, 13 |
| Vitest | 2 |
| `stock` эрх мэдэлтэй дүрэм | 4 |
| Server Action бүрт эрх шалгалт | 18 (`requireAdmin`) |
| Cookie-гийн аюулгүй атрибутууд | 16 (`sessionCookieOptions`) |
| `revalidateTag(tag, "max")` | 18 (`refresh`) |
| `generateStaticParams` DB-ээс | 8 |
| Suspense хилүүд | 14 |
| Deployment env хувьсагчид | 20 |
