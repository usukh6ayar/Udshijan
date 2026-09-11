export type ColorOption = { name: string; hex: string };
export type SizeOption = { label: string; inStock: boolean };
export type WholesaleTier = { min: number; max?: number; price: number };

export type ProductBadge = "new" | "wholesale" | "lowStock";

export type Product = {
  slug: string;
  sku: string;
  brand: string;
  /** Карт дээр гарах богино нэр */
  title: string;
  /** Дэлгэрэнгүй хуудас/сагсанд гарах бүтэн нэр (өнгө орсон) — байхгүй бол title */
  titleFull?: string;
  /** Ангилалын slug, ж: "huvtsas" */
  category: string;
  /** Дэд ангилалын slug, ж: "futbolk" */
  subcategory: string;
  /** Хүйсийн салбар — ангилалын хуудсанд ашиглана */
  section?: "eregtei" | "emegtei" | null;
  price: number;
  /** Хямдралын өмнөх үнэ. Байвал -N% badge гарна. */
  compareAt?: number;
  rating: number;
  reviewCount: number;
  soldCount?: number;
  colors: ColorOption[];
  sizes: SizeOption[];
  /** 0 = үлдэгдэл дууссан */
  stock: number;
  wholesale?: { tiers: WholesaleTier[]; minOrder: number };
  /** Placeholder дээр гарах бичиг, ж: "футболк" */
  imageLabel: string;
  imageCount: number;
  description: string;
  /** Тайлбарын доорх нэмэлт мөрүүд (материал, угаалт, үйлдвэрлэгч) */
  descriptionNotes?: string[];
  specs: { label: string; value: string }[];
  badges?: ProductBadge[];
  /** Нүүр хуудасны хэсгүүдэд харуулах */
  featured?: ("bestseller" | "new")[];
};

export type Category = {
  slug: string;
  name: string;
  /** Толгойн цэсэнд харагдах эсэх */
  inNav: boolean;
  productCount: number;
  imageLabel: string;
  subcategories: { slug: string; name: string; count: number }[];
};

export type Brand = { slug: string; name: string; count: number };
