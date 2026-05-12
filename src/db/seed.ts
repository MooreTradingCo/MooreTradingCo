import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { db } from "./index";
import { categories, products, productImages, settings } from "./schema";

const placeholderImg = (label: string) =>
  `https://images.unsplash.com/photo-1604908554027-d36f3e7d1c30?auto=format&fit=crop&w=1200&q=80&sig=${encodeURIComponent(label)}`;

async function main() {
  console.log("Seeding categories...");
  const cats = await db
    .insert(categories)
    .values([
      { slug: "seasonings", name: "Seasonings", description: "Hand-blended dry rubs and spice mixes.", sortOrder: 1 },
      { slug: "sauces", name: "Sauces", description: "Slow-simmered sauces and finishing glazes.", sortOrder: 2 },
      { slug: "salts", name: "Finishing Salts", description: "Small-batch infused salts.", sortOrder: 3 },
      { slug: "prepared-foods", name: "Prepared Foods", description: "Pantry-ready prepared foods.", sortOrder: 4 },
    ])
    .onConflictDoNothing()
    .returning();

  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c.id]));
  // If onConflictDoNothing returned nothing (already seeded), fetch them
  if (cats.length === 0) {
    const existing = await db.select().from(categories);
    for (const c of existing) bySlug[c.slug] = c.id;
  }

  console.log("Seeding products...");
  const productData = [
    {
      slug: "classic-bbq-rub",
      name: "Classic BBQ Rub",
      shortDescription: "Sweet, smoky, and built for low-and-slow.",
      description:
        "Our signature BBQ rub layers brown sugar, smoked paprika, and a touch of espresso for the perfect bark on ribs, pork shoulder, and brisket.",
      ingredients: "Brown sugar, smoked paprika, kosher salt, espresso, garlic, onion, black pepper, cumin.",
      categoryId: bySlug["seasonings"],
      priceCents: 1200,
      weightOz: 5,
      stockQty: 48,
      sku: "MTC-SEAS-001",
      isFeatured: true,
    },
    {
      slug: "lemon-pepper-everything",
      name: "Lemon Pepper Everything",
      shortDescription: "Bright lemon, cracked pepper, addictive on anything.",
      description:
        "Bright dehydrated lemon zest and coarse-cracked Tellicherry pepper. Try it on chicken wings, roasted vegetables, or popcorn.",
      ingredients: "Lemon zest, black pepper, sea salt, garlic, onion.",
      categoryId: bySlug["seasonings"],
      priceCents: 1000,
      weightOz: 4,
      stockQty: 60,
      sku: "MTC-SEAS-002",
      isFeatured: true,
    },
    {
      slug: "carolina-gold-sauce",
      name: "Carolina Gold Sauce",
      shortDescription: "Mustard-forward, vinegar-tangy, slow-simmered.",
      description:
        "A South Carolina–style mustard BBQ sauce with honey and apple cider vinegar. Pour it on pulled pork or use as a glaze.",
      ingredients: "Yellow mustard, apple cider vinegar, honey, brown sugar, spices.",
      categoryId: bySlug["sauces"],
      priceCents: 1400,
      weightOz: 12,
      stockQty: 36,
      sku: "MTC-SAUC-001",
      isFeatured: true,
    },
    {
      slug: "smoked-cherry-bbq",
      name: "Smoked Cherry BBQ Sauce",
      shortDescription: "Door county cherries, hickory smoke.",
      description:
        "Tart cherries reduced with hickory smoke and just enough heat. Brush on ribs in the last 10 minutes of the cook.",
      ingredients: "Cherries, tomato, brown sugar, vinegar, hickory smoke, spices.",
      categoryId: bySlug["sauces"],
      priceCents: 1500,
      weightOz: 12,
      stockQty: 28,
      sku: "MTC-SAUC-002",
    },
    {
      slug: "smoked-flake-salt",
      name: "Smoked Flake Salt",
      shortDescription: "Cold-smoked over applewood for 14 hours.",
      description:
        "Maldon-style flake salt, cold-smoked over applewood. Finish a steak, a tomato, or a chocolate-chip cookie.",
      ingredients: "Sea salt flakes, applewood smoke.",
      categoryId: bySlug["salts"],
      priceCents: 1800,
      weightOz: 3,
      stockQty: 40,
      sku: "MTC-SALT-001",
      isFeatured: true,
    },
    {
      slug: "rosemary-citrus-salt",
      name: "Rosemary Citrus Salt",
      shortDescription: "Fresh rosemary, lemon and orange zest.",
      description:
        "Hand-rubbed with fresh rosemary and dehydrated citrus zest. Excellent on roast chicken, potatoes, or a rimmed cocktail.",
      ingredients: "Sea salt, rosemary, lemon zest, orange zest.",
      categoryId: bySlug["salts"],
      priceCents: 1400,
      weightOz: 3,
      stockQty: 35,
      sku: "MTC-SALT-002",
    },
    {
      slug: "smoked-tomato-jam",
      name: "Smoked Tomato Jam",
      shortDescription: "The condiment your burger deserves.",
      description:
        "Slow-cooked Roma tomatoes with applewood smoke and a hint of chipotle. Spread it on burgers, biscuits, or a grilled cheese.",
      ingredients: "Tomatoes, onion, brown sugar, vinegar, chipotle, spices.",
      categoryId: bySlug["prepared-foods"],
      priceCents: 1100,
      weightOz: 9,
      stockQty: 24,
      sku: "MTC-PREP-001",
    },
    {
      slug: "spiced-pecans",
      name: "Bourbon Spiced Pecans",
      shortDescription: "Brown sugar, bourbon, cayenne.",
      description:
        "Roasted Georgia pecans tossed in bourbon, brown sugar, and a whisper of cayenne. Dangerously snackable.",
      ingredients: "Pecans, brown sugar, bourbon, butter, cayenne, salt.",
      categoryId: bySlug["prepared-foods"],
      priceCents: 1600,
      weightOz: 6,
      stockQty: 30,
      sku: "MTC-PREP-002",
    },
  ];

  for (const p of productData) {
    const [inserted] = await db
      .insert(products)
      .values(p)
      .onConflictDoNothing({ target: products.slug })
      .returning();
    if (inserted) {
      await db.insert(productImages).values({
        productId: inserted.id,
        url: placeholderImg(inserted.slug),
        alt: inserted.name,
        sortOrder: 0,
      });
    }
  }

  console.log("Seeding settings...");
  await db
    .insert(settings)
    .values([
      { key: "flat_shipping_cents", value: "795" },
      { key: "free_shipping_threshold_cents", value: "7500" },
      { key: "shipping_origin_zip", value: process.env.SHIP_FROM_ZIP ?? "00000" },
      { key: "shipping_origin_state", value: process.env.SHIP_FROM_STATE ?? "" },
      { key: "tax_rates_json", value: "{}" },
    ])
    .onConflictDoNothing();

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
