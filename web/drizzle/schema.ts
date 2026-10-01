import {
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type {
  ColorOption,
  ProductBadge,
  SizeOption,
  WholesaleTier,
} from "@/lib/data/types";
import type {
  OrderItem,
  OrderStatus,
  PaymentMethod,
  ShippingMethod,
} from "@/lib/orders/types";

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

export const orders = pgTable("orders", {
  number: text("number").primaryKey(),
  status: text("status").$type<OrderStatus>().notNull().default("new"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  paidVia: text("paid_via").$type<"demo" | "admin">(),
  /** Захиалагчийн cookie-д хадгалагдах санамсаргүй түлхүүр */
  accessKey: text("access_key").notNull(),
  name: text("name").notNull(),
  /** Зөвхөн цифр, 8 орон */
  phone: text("phone").notNull(),
  email: text("email").notNull().default(""),
  city: text("city").notNull(),
  district: text("district").notNull(),
  khoroo: text("khoroo").notNull().default(""),
  address: text("address").notNull().default(""),
  note: text("note").notNull().default(""),
  shipping: text("shipping").$type<ShippingMethod>().notNull(),
  payment: text("payment").$type<PaymentMethod>().notNull(),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  subtotal: integer("subtotal").notNull(),
  couponCode: text("coupon_code"),
  couponDiscount: integer("coupon_discount").notNull(),
  shippingFee: integer("shipping_fee").notNull(),
  total: integer("total").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type OrderRow = typeof orders.$inferSelect;
export type OrderInsert = typeof orders.$inferInsert;
