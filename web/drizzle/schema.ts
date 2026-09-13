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
