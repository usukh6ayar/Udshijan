// tsx нь Next-ийн бандлерийг ашигладаггүй тул "@/" alias-ийг value import дээр
// шууд танихгүй — иймд энд харьцангуй зам ашиглав.
import { db } from "../lib/db";
import { products as table } from "./schema";
import { products as seedData } from "../lib/data/products.seed";

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
