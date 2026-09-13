# Admin хуудас — 1-р үе шат: DB + нэвтрэлт + бүтээгдэхүүний CRUD

Огноо: 2026-09-13
Төлөв: батлагдсан, хэрэгжүүлэхэд бэлэн

## Зорилго

Udshijan дэлгүүрийн бүтээгдэхүүнийг код засахгүйгээр, deploy хийхгүйгээр удирдах
боломжтой болгох. Админ хадгалсан өөрчлөлт дэлгүүр дээр шууд тусна.

Өнөөдөр `lib/data/products.ts` дотор 17 бүтээгдэхүүн хатуу бичигдсэн байгаа.
Үүнийг Postgres руу шилжүүлж, дээр нь админ CRUD хийнэ.

## Хамрах хүрээ

Багтах зүйл:

- Postgres өгөгдлийн сан, Drizzle ORM
- Админы нэвтрэлт (ганц нууц үг)
- Бүтээгдэхүүн нэмэх / засах / устгах
- Одоогийн 17 бүтээгдэхүүнийг DB рүү оруулах seed script
- Cache Components асааж, засвар шууд тусдаг болгох
- Клиент талын 4 модулийг DB-д тохируулан шилжүүлэх (доор дэлгэрэнгүй)
- Vitest суулгах — төсөлд тест runner байхгүй

Багтахгүй зүйл (дараагийн үе шатууд):

- 2-р үе: ангилал, брэндийг DB рүү (одоохондоо `lib/data/catalog.ts`-д код хэвээр)
- 3-р үе: захиалга — checkout DB рүү бичих, төлөв удирдах.
  Үүнд `components/shop/OrderLookup.tsx` өөрчлөгдөнө. Тэр файл одоо санаатайгаар
  үргэлж «олдсонгүй» гэж хариулдаг, учир нь backend байхгүй.
- 4-р үе: борлуулалтын хянах самбар (3-р үе байхгүй бол харуулах өгөгдөлгүй)
- Зураг upload: сайт бүхэлдээ `components/Placeholder.tsx` дээр явж байгаа,
  бодит зураг огт байхгүй. Бодит зураг орох шийдвэр гартал хойшлуулна.

## Гол зарчим: `Product` бол гэрээ

Хамгийн чухал архитектурын шийдвэр. DB давхарга нь `lib/data/types.ts`-д байгаа
яг тэр `Product` хэлбэрийг буцаана. Drizzle-ийн үүсгэсэн төрлүүд энэ хилээс цааш
гарахгүй.

```
Postgres
  ↓
drizzle/schema.ts
  ↓
mapper / normalize          ← DB төрөл энд төгсөнө
  ↓
Product (lib/data/types.ts)
  ↓
lib/data/products.ts        ← экспортын гарын үсэг хэвээр
  ↓
одоогийн дэлгүүрийн компонентууд   ← гар хүрэхгүй
```

`productBySlug()`, `productsByFeature()`, `relatedProducts()` гурав одоогийн
буцаах `Product` төрлөө хадгална. Гэхдээ **синхрон биш, async болно.**

### Энэ гэрээ хаана хүчинтэй вэ

Гэрээ нь **сервер талын хэрэглэгчдэд** хүчинтэй — тэнд `await` хийж болно.
Клиент компонентууд DB рүү хандаж чадахгүй тул тэднийг тусад нь шилжүүлнэ.

`products` нь одоо модулийн түвшний `const` массив (`products.ts:16`). DB дээр
энэ боломжгүй тул **массив экспортыг устгана.** Дараах импортлогчид бүгд
өөрчлөгдөнө:

| Файл | Төрөл | Хийх зүйл |
|---|---|---|
| `app/page.tsx` | сервер | `await` нэмнэ |
| `app/hailt/page.tsx` | сервер | `await` нэмнэ |
| `app/booniy-hudaldaa/page.tsx` | сервер | `await` нэмнэ |
| `app/p/[slug]/page.tsx` | сервер | `await` нэмнэ |
| `lib/search.ts` | сервер | `searchProducts(products, query)` болгож цэвэр функц болгоно |
| `components/shop/CategoryView.tsx` | **клиент** | эцэг серверээс prop-оор хүлээж авна |
| `app/styleguide/page.tsx` | **клиент** | сервер wrapper 4 жишээ бүтээгдэхүүн дамжуулна |
| `lib/cart.ts` | **клиент** | доорх «Клиент талын шийдэл» хэсгийг үз |
| `lib/wishlist.ts` | **клиент** | доорх «Клиент талын шийдэл» хэсгийг үз |

`lib/filters.ts:109`-ийн `applyFilters(products, f)` аль хэдийн цэвэр функц —
өөрчлөгдөхгүй.

## Клиент талын шийдэл

Энэ бол шилжилтийн хамгийн нарийн хэсэг.

`lib/cart.ts:153` болон `lib/wishlist.ts:82` дээрх `productBySlug` дуудлага нь
`useSyncExternalStore`-оос гаралтай **синхрон `useMemo`** дотор байна:

```ts
const resolved = useMemo<ResolvedLine[]>(
  () => data.lines.flatMap((line) => {
    const product = productBySlug(line.slug);   // ← синхрон байх ёстой
    ...
```

Async хувилбарыг энд шууд тавих боломжгүй. Асуудал нь «клиент компонент await
хийж чадахгүй» биш, харин **энэ синхрон дериваци await хийж чадахгүй** явдал.
Тиймээс store-ыг өөрчилнө.

**Шийдэл:** `localStorage` дотор хадгалах өгөгдөл хэвээр — `{slug, color, size,
qty}`. Бүтээгдэхүүний мэдээллийг тусад нь авна:

- `GET /api/products?slugs=a,b,c` Route Handler `Product[]` буцаана
- Store дотор resolved бүтээгдэхүүний cache-ийг React state-д барина
- `slugs` өөрчлөгдөхөд effect дотор татаж, cache-ийг шинэчилнэ
- `useMemo` нь статик массивын оронд энэ cache-ийн эсрэг resolve хийнэ

Үр дагавар: сагс, хүслийн жагсаалт дээр богино хугацааны ачаалж буй төлөв
гарна. Өмнө нь шууд байсан. Энэ бол хүлээн зөвшөөрсөн зардал —
`CartView`, `WishlistView` хоёрыг клиент компонент хэвээр үлдээж, засварыг
хамгийн бага байлгах гэсэн сонголт.

`CategoryView` илүү хялбар: эцэг нь `app/c/[slug]/page.tsx` аль хэдийн
`<Suspense>` дотор render хийдэг тул бүтээгдэхүүний жагсаалтыг prop-оор
дамжуулахад хангалттай.

## Файлын бүтэц

```
web/
  drizzle/schema.ts          products хүснэгтийн тодорхойлолт
  drizzle/seed.ts            одоогийн 17 бүтээгдэхүүнийг оруулах
  lib/db.ts                  холболт
  lib/data/products.ts       дотроо DB рүү ханддаг болно, экспорт нь хэвээр
  lib/data/mapper.ts         DB мөр → Product, normalize дүрмүүд
  lib/admin/auth.ts          нууц үг шалгах, session cookie гарын үсэг
  lib/admin/actions.ts       Server Actions
  app/admin/newterh/page.tsx нэвтрэх форм
  app/admin/page.tsx         бүтээгдэхүүний жагсаалт
  app/admin/[slug]/page.tsx  засах форм
  app/api/products/route.ts  клиент store-д slug-аар Product[] буцаах
  proxy.ts                   optimistic redirect (аюулгүй байдлын хил БИШ)
```

## Өгөгдлийн сан

Vercel Marketplace-аас Postgres холбоно.

Анхаарах зүйл: «Vercel Postgres» нэртэй анхны бүтээгдэхүүн Marketplace
интеграци болж өөрчлөгдсөн. Env хувьсагчийн нэрийг таамаглаж болохгүй.
Холбосны дараа `npx vercel env pull` ажиллуулж, `.env.local`-д үнэхээр ямар нэр
бууснаас нь уншиж кодлоно. Драйверын package-ийг мөн интеграцийн өөрийнх нь
баримтаас шалгана.

### Схем

`products` хүснэгт:

- Хавтгай баганууд: `slug` (primary key), `sku`, `brand`, `title`, `titleFull`,
  `category`, `subcategory`, `section`, `price`, `compareAt`, `rating`,
  `reviewCount`, `soldCount`, `stock`, `imageLabel`, `imageCount`, `description`
- JSONB баганууд: `colors`, `sizes`, `wholesale`, `specs`, `badges`, `featured`,
  `descriptionNotes`

17 бүтээгдэхүүн, нэг админтай үед үүрлэсэн бүтцийг тусад нь хүснэгт болгож
задлахад ашиг гарахгүй. Хэрэгцээ гарвал дараа хийнэ.

### `stock` болон `sizes[].inStock`

Эдгээр хоёр зөрчилдөж болно. Дүрэм: `stock` эрх мэдэлтэй.

Энэ дүрмийг DB constraint-ээр биш, **mapper давхарга дээр enforce хийнэ** —
`Product` буцаахын өмнө:

```ts
if (row.stock === 0) {
  sizes = sizes.map((s) => ({ ...s, inStock: false }));
}
```

Ингэснээр DB-д хуучин эсвэл зөрүүтэй JSON байсан ч дэлгүүр буруу үлдэгдэл
харуулахгүй. `sizes[].inStock` нь зөвхөн `stock > 0` үед утгатай.

Админы форм хоёуланг нь засна, дүрмийг форм дээр тайлбарлана.

## Нэвтрэлт

`ADMIN_PASSWORD` env хувьсагчид нууц үг. Нэвтэрвэл `ADMIN_SESSION_SECRET`-ээр
HMAC гарын үсэг зурсан session cookie өгнө.

Cookie-гийн шаардлага:

- `HttpOnly`
- `Secure` (production дээр)
- `SameSite=Lax`
- `Path=/`
- `Max-Age` тодорхой заасан
- Payload дотор дуусах хугацаа (`exp`)
- Гарын үсгийг constant-time аргаар харьцуулна
- `ADMIN_SESSION_SECRET` нь хангалттай урт санамсаргүй утга

Нууц үг өөрөө cookie-д хэзээ ч орохгүй.

### Cache Components-ийн хязгаарлалт

Cached scope болон layout-ийн дээд талд `cookies()` унших боломжгүй:

- `authentication-with-cache-components.md:117` — «With Cache Components, reading
  `cookies()` outside a boundary is a build error.»
- `use-cache.md:241` — cached функц `cookies()`, `headers()`, `searchParams`-д
  хандаж чадахгүй, энэ хязгаарлалт дуудлагын стек даган үйлчилнэ.

Тиймээс эрх шалгах бүтэц:

1. `proxy.ts` — cookie байгаа эсэхийг optimistic шалгаж, байхгүй бол
   `/admin/newterh` руу чиглүүлнэ. Энэ бол зөвхөн UX. Next-ийн баримт
   тодорхой хэлдэг: proxy-г «full session management or authorization solution»
   болгож ашиглаж болохгүй.
2. Админ хуудсанд session уншилт `<Suspense>` boundary дотор байна, layout-ийн
   дээд талд биш.
3. **Жинхэнэ хамгаалалтын хил — Server Action бүрийн дотор.** Server Action-ууд
   кэшлэгддэггүй тул cookie чөлөөтэй уншина.

3-р цэг заавал биелэх ёстой. Next-ийн баримт: «Server Functions are reachable
via direct POST requests, not just through your application's UI. Always verify
authentication and authorization inside every Server Function.» Зөвхөн хуудсыг
хаагаад mutation-ыг нээлттэй үлдээх нь түгээмэл нүх. Vercel Deployment
Protection үүнийг орлохгүй.

## Кэш ба шинэчлэлт

`next.config.ts`-д `cacheComponents: true`.

Уншилтын функцууд `use cache` + `cacheTag("products")` болон бүтээгдэхүүн тус
бүрд `cacheTag("product-" + slug)`.

Mutation-ы дараа:

```ts
revalidateTag("products", "max");
revalidateTag(`product-${slug}`, "max");
```

Хоёр аргументтай хэлбэр заавал. `revalidateTag.md:61` — ганц аргументтай хэлбэр
deprecated болсон.

`updateTag` хэрэггүй. Тэр нь read-your-own-writes-д зориулагдсан, харин админ
хуудсууд cookie уншдаг тул кэшлэгддэггүй — админ өөрийн засварыг DB-ээс шууд
шинээр уншина. Дэлгүүрийн талд бага зэрэг stale-while-revalidate хүлээн
зөвшөөрөгдөнө.

### `generateStaticParams` ба Suspense

`generateStaticParams` DB-ээс бүх slug-ийг буцаана:

```ts
return (await allProductSlugs()).map((slug) => ({ slug }));
```

Placeholder param ашиглахгүй — 17 бүтээгдэхүүн цөөхөн тул бүгдийг prerender
хийхэд хангалттай.

**Үүний үр дагавар: build хийхэд `DATABASE_URL` шаардлагатай болно.** DB
хүрэхгүй үед Vercel build унана. Энэ бол ухамсартай хүлээн авсан өртөг.

Suspense-ийг зөвхөн `params`-ийг тойруулж биш, **runtime/uncached өгөгдөлд
хандах хилд** байрлуулна:

```tsx
export default async function Page({ params }) {
  const { slug } = await params;
  return (
    <>
      <StaticShell />
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent slug={slug} />
      </Suspense>
    </>
  );
}
```

Энэ нь цэвэрхэн бүтэц төдий биш. Админ **build-ийн дараа** нэмсэн
бүтээгдэхүүний slug нь `generateStaticParams`-ийн жагсаалтад байхгүй тул
runtime param болно. `dynamic-routes.md:267` — «For runtime params not returned
by `generateStaticParams`, validation occurs during the first request.»
Suspense boundary байхгүй бол шинэ бүтээгдэхүүн эвдэрнэ.

### Шилжилтийн ажил

Апп одоогоор `dynamic`, `revalidate`, `fetchCache`, `dynamicParams` гэсэн route
segment config огт ашигладаггүй тул устгах зүйл алга.

Ажил нь `generateStaticParams`-тай 3 замд төвлөрнө: `app/p/[slug]`,
`app/c/[slug]`, `app/tuslamj/[slug]`. Тус бүр дор хаяж 1 param буцаах ёстой
(хоосон массив алдаа өгнө), мөн Suspense хилээ зөв байрлуулна.

Next баг энэ шилжилтэд зориулж `next-cache-components-adoption` skill гаргасан:

```
npx skills add vercel/next.js --skill next-cache-components-adoption
```

## Алдаа боловсруулалт

Формын оролтыг серверт шалгана: үнэ сөрөг биш, `slug` давхардахгүй, заавал
талбарууд бөглөгдсөн. Алдааг `components/ui/Field.tsx`-ийн `error` prop-оор
формын дээр монголоор харуулна.

DB хүрэхгүй үед дэлгүүрийн хуудас 500 биш, ойлгомжтой алдааны хуудас харуулна.

## Тест

Төсөлд одоогоор тест runner байхгүй — `package.json`-д `test` script алга,
config файл ч байхгүй. Тиймээс **Vitest суулгах нь хэрэгжүүлэлтийн эхний
ажлуудын нэг** болно, төлөвлөгөө үүнийг бодит алхмуудаар эзэмшинэ.

Шалгах зүйлс:

- `mapper` нь DB мөрөөс зөв `Product` хэлбэр үүсгэж байгаа эсэх
- `stock === 0` үед бүх `sizes[].inStock` худал болж байгаа эсэх
- Хуурамч гарын үсэгтэй cookie-г татгалзаж байгаа эсэх
- Хугацаа дууссан session-ыг татгалзаж байгаа эсэх
- Нэвтрээгүй үед Server Action бүр татгалзаж байгаа эсэх
- `productBySlug`, `productsByFeature`, `relatedProducts` гурвын буцаах утга
  шилжилтийн өмнөх үеийнхтэй ижил байгаа эсэх
- `searchProducts(products, query)` цэвэр функц болсны дараа өмнөхтэй ижил
  илэрц буцааж байгаа эсэх
- `GET /api/products?slugs=...` зөвхөн хүссэн slug-уудыг буцааж байгаа эсэх

## Deployment шаардлага

- `DATABASE_URL` (эсвэл интеграцийн өгсөн нэр) — build болон runtime хоёуланд
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Гурвуулаа Vercel дээр production, preview, development орчинд тохируулагдана.
