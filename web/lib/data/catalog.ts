import type { Brand, Category } from "./types";

/** Дизайны өнгөний swatch-ууд (1c шүүлтүүр, 1d вариант) */
export const COLORS = [
  { name: "Хар", hex: "#17171A" },
  { name: "Цагаан", hex: "#FFFFFF" },
  { name: "Цэнхэр", hex: "#3B5B84" },
  { name: "Хүрэн", hex: "#8A6F4E" },
  { name: "Улаан", hex: "#8E3B3B" },
  { name: "Ногоон", hex: "#3B7A5B" },
] as const;

export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export const categories: Category[] = [
  {
    slug: "huvtsas",
    name: "Хувцас",
    inNav: true,
    productCount: 3240,
    imageLabel: "хувцас",
    subcategories: [
      { slug: "futbolk", name: "Футболк", count: 412 },
      { slug: "tsamts", name: "Цамц", count: 268 },
      { slug: "kurtka", name: "Куртка", count: 196 },
      { slug: "omd", name: "Өмд", count: 224 },
      { slug: "gutal", name: "Гутал", count: 184 },
    ],
  },
  {
    slug: "goo-saihan",
    name: "Гоо сайхан",
    inNav: true,
    productCount: 1870,
    imageLabel: "гоо сайхан",
    subcategories: [
      { slug: "archilgaa", name: "Арьс арчилгаа", count: 640 },
      { slug: "buden", name: "Будалт", count: 385 },
      { slug: "vners", name: "Үнэртэн", count: 210 },
    ],
  },
  {
    slug: "ger-ahui",
    name: "Гэр ахуй",
    inNav: true,
    productCount: 2410,
    imageLabel: "гэр ахуй",
    subcategories: [
      { slug: "gal-togoo", name: "Гал тогоо", count: 720 },
      { slug: "untlaga", name: "Унтлагын хэрэгсэл", count: 430 },
      { slug: "gerelt", name: "Гэрэлтүүлэг", count: 265 },
    ],
  },
  {
    slug: "tsahilgaan",
    name: "Цахилгаан бараа",
    inNav: true,
    productCount: 1120,
    imageLabel: "цахилгаан",
    subcategories: [
      { slug: "audio", name: "Дуу, чихэвч", count: 310 },
      { slug: "gerin-tehnik", name: "Гэрийн техник", count: 486 },
    ],
  },
  {
    slug: "busad",
    name: "Бусад",
    inNav: true,
    productCount: 1560,
    imageLabel: "бусад",
    subcategories: [
      { slug: "tsunh", name: "Цүнх", count: 240 },
      { slug: "sport", name: "Спорт", count: 318 },
    ],
  },
];

export const brands: Brand[] = [
  { slug: "uds-basic", name: "UDS Basic", count: 322 },
  { slug: "tergel", name: "Tergel", count: 148 },
  { slug: "stepz", name: "Stepz", count: 96 },
  { slug: "soundo", name: "Soundo", count: 84 },
  { slug: "aqua-lab", name: "Aqua Lab", count: 77 },
  { slug: "homely", name: "Homely", count: 63 },
  { slug: "luma", name: "Luma", count: 41 },
];

/** Дизайны "+ 12 брэнд харах" мөрөнд ашиглана */
export const HIDDEN_BRAND_COUNT = 12;

export function categoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
