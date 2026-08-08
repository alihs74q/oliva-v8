/**
 * seedCmsContent.ts
 * ─────────────────
 * Re-runnable seeder that imports all static Oliva menu data into the CMS
 * database tables. Running it twice will NOT duplicate rows or overwrite
 * later admin edits — it only inserts rows that don't already exist.
 *
 * Admin accounts are created WITHOUT a password hash. Each admin must visit
 * /#/admin and use "Set Initial Password" on their first login. This ensures
 * no credentials are ever committed to source code or readable log files.
 *
 * Run with:
 *   pnpm --filter @workspace/scripts run seed:cms
 */

import { randomBytes } from "node:crypto";
import { db } from "@workspace/db";
import {
  adminUsersTable,
  cmsSectionsTable,
  cmsSubcategoriesTable,
  cmsProductsTable,
  cmsSiteSettingsTable,
  cmsReleasesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";

// ─── Exchange rate ─────────────────────────────────────────────────────────────
const RATE_PER_USD = 89500;
const ROUNDING_TO = 50000;

function computeUsd(priceLbp: number): string {
  if (priceLbp === 0) return "$0";
  const raw = priceLbp / RATE_PER_USD;
  const rounded = Math.round(raw * 2) / 2;
  if (rounded === Math.floor(rounded)) return `$${rounded}`;
  return `$${rounded.toFixed(2)}`;
}

// ─── Static data ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { slug: "cold-drinks", name: "Cold Drinks", subtitle: "Chilled & Refreshing", sortOrder: 0, theme: { bgGradient: "linear-gradient(160deg,#0e3a5f,#1565a8 55%,#0a4a7a)", glowColor: "#D4A843", text: "#f1f5f9", subtext: "#94a3b8", accent: "#D4A843" } },
  { slug: "hot-drinks",  name: "Hot Drinks",  subtitle: "Warm & Aromatic",      sortOrder: 1, theme: { bgGradient: "linear-gradient(160deg,#5c2e0a,#8b4513 55%,#6e3410)", glowColor: "#E7A05A", text: "#fdf6e3", subtext: "#c9a57b", accent: "#E7A05A" } },
  { slug: "desserts",    name: "Desserts",    subtitle: "Sweet Indulgence",      sortOrder: 2, theme: { bgGradient: "linear-gradient(160deg,#5a1a3a,#8b1a4a 55%,#6e1240)", glowColor: "#E5A4B7", text: "#fdf2f8", subtext: "#d4a5b8", accent: "#E5A4B7" } },
  { slug: "shisha",      name: "Shisha",      subtitle: "Premium Flavors",       sortOrder: 3, theme: { bgGradient: "linear-gradient(160deg,#3d2e0a,#6b5010 55%,#4a3808)", glowColor: "#C5A342", text: "#f5f5f4", subtext: "#a8a29e", accent: "#C5A342" } },
  { slug: "sandwiches",  name: "Sandwiches",  subtitle: "Fresh & Delicious",     sortOrder: 4, theme: { bgGradient: "linear-gradient(160deg,#5c2e0a,#8b4513 55%,#6e3410)", glowColor: "#D8B84E", text: "#fdf6e3", subtext: "#c9a57b", accent: "#D8B84E" } },
  { slug: "yogurt",      name: "Yogurt",      subtitle: "Creamy & Refreshing",   sortOrder: 5, theme: { bgGradient: "linear-gradient(160deg,#4a1a5a,#8b1a7a 55%,#6e1256)", glowColor: "#A78AC4", text: "#fdf2f8", subtext: "#d4a5d8", accent: "#A78AC4" } },
  { slug: "padel",       name: "Padel",       subtitle: "Court & Coaching",      sortOrder: 6, theme: { bgGradient: "linear-gradient(160deg,#003a4d,#006b8f 55%,#004d6b)", glowColor: "#4F82C5", text: "#f0f9fa", subtext: "#7dd3fc", accent: "#4F82C5" } },
];

interface ProductSeed {
  name: string;
  shortName?: string;
  description: string;
  priceLbp: number;
  imageUrl?: string | null;
  recipe?: string;
  flavors?: string[];
  calories?: number;
  extraCalories?: Record<string, number>;
}
interface SubcategorySeed { id: string; name: string; description: string; themeColor: string; accentColor: string; imageUrl?: string | null; products: ProductSeed[] }

const SEED_CALORIES: Record<string, number> = {
  "Foral Fusion": 280,
  Mango: 300,
  Strawberry: 280,
  "Passion Fruit": 280,
  "Cookies & Cream": 600,
  "Strawberry Whip": 450,
  "Choco-Nut Milkshake": 550,
  "Vanilla Milkshake": 450,
  "Lotus Milkshake": 600,
  "Oliva Milkshake": 500,
  "Mocha Frappe": 280,
  "Caramel Frappe": 280,
  "Vanilla Frappe": 260,
  "Toffee Nut Frappe": 300,
  "Oliva Frappe": 280,
  "Iced Spanish Latte": 240,
  "Iced Mocha Latte": 260,
  "Iced Latte (Vanilla, Hazelnut, Salted Caramel)": 190,
  "Irish Cream Latte": 200,
  "Caramel Macchiato": 250,
  "Iced Matcha Latte": 190,
  "Razzlychee Iced Tea": 150,
  "Tropical Iced Tea": 160,
  "Peach Iced Tea": 160,
  "Kiwi Mojito": 120,
  "Passion Crush": 130,
  "Summer Mix": 150,
  "Café Latte (Vanilla, Hazelnut)": 250,
  "Hot Chocolate": 290,
  Cappuccino: 140,
  Espresso: 10,
  Tea: 2,
  "Ginger and Honey": 70,
  Chamomile: 2,
  "Green Tea": 2,
  "Lazy Cake": 400,
  Fondant: 500,
  "Chocolate Cake": 530,
  "Oreo Cheesecake": 390,
  "Raspberry Cheesecake": 400,
  "Vanilla Mushroom Muffin": 380,
  "Chocolate Mushroom Muffin": 450,
  Croissant: 270,
  "Tuna Cado": 460,
  "Turkey and Cheese": 450,
  "Hallum Pesto": 500,
  "Chicken Cesar Salad": 550,
  Nuts: 300,
  "Greek Yogurt": 160,
  "Mango Greek Yogurt": 230,
  Toppings: 100,
};

const DEFAULT_EXTRA_CALORIES = { Cream: 80, "Ice Cream": 180, Flavor: 50 };

function seedCalories(name: string): number {
  return SEED_CALORIES[name] ?? 0;
}

function seedExtraCalories(subcategoryId: string): Record<string, number> {
  if (["smoothies", "milk-shake", "coffee-frappe", "iced-latte", "refreshers"].includes(subcategoryId)) {
    return DEFAULT_EXTRA_CALORIES;
  }
  if (["cakes", "cheesecakes", "pastries"].includes(subcategoryId)) {
    return { "Ice Cream": DEFAULT_EXTRA_CALORIES["Ice Cream"] };
  }
  return {};
}

const SUBCATEGORIES: Record<string, SubcategorySeed[]> = {
  "cold-drinks": [
    {
      id: "smoothies", name: "Smoothies", description: "Fresh fruit blended to perfection", themeColor: "#16a34a", accentColor: "#86efac",
      imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Style_of_cub_cold_drink_202607240431-TrhRjFxd4wxoAx2gsQCFMQNxRLCWI3.jpeg",
      products: [
        { name: "Foral Fusion",   description: "A vibrant blend of fresh fruit flavors.", priceLbp: 300000, imageUrl: "/floral-fusion.png",          recipe: "Mixed fruits · Fruit juice · Floral flavor · Ice", flavors: [] },
        { name: "Mango",          description: "Ripe mango blended to perfection.",        priceLbp: 300000, imageUrl: "/mango-smoothie.png",         recipe: "Mango · Fruit juice · Ice",                        flavors: [] },
        { name: "Strawberry",     description: "Fresh strawberries, creamy and sweet.",    priceLbp: 300000, imageUrl: "/strawberry-smoothie.png",     recipe: "Strawberries · Fruit juice · Ice",                 flavors: [] },
        { name: "Passion Fruit",  description: "Tropical passion fruit, tangy and refreshing.", priceLbp: 300000, imageUrl: "/passion-fruit-smoothie.png", recipe: "Passion fruit · Fruit juice · Ice",            flavors: [] },
      ],
    },
    {
      id: "milk-shake", name: "Milkshakes", description: "Thick, creamy, and indulgent", themeColor: "#d97706", accentColor: "#fcd34d",
      imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_cub_with_milkshakes_202607240432-DyeXQYjJj3Qg2lXxkb8gT9y7V0T2mz.jpeg",
      products: [
        { name: "Cookies & Cream",    description: "Crushed cookies blended into silky cream.", priceLbp: 400000, imageUrl: "/cookies-cream-milkshake.png",           recipe: "Milk · Ice · Oreo cookies" },
        { name: "Strawberry Whip",    description: "Fresh strawberries with whipped cream.",     priceLbp: 350000, imageUrl: "/images/products/StrawberryWhip.jpg",     recipe: "Milk · Ice · Strawberry" },
        { name: "Choco-Nut Milkshake",description: "Chocolate and nut blend, rich and creamy.", priceLbp: 350000, imageUrl: "/images/products/ChocoNutMilkshake.jpg",  recipe: "Milk · Ice · Chocolate · Hazelnut" },
        { name: "Vanilla Milkshake",  description: "Classic vanilla bean milkshake.",            priceLbp: 350000, imageUrl: "/images/products/VanillaMilkshake.jpg",   recipe: "Milk · Ice · Vanilla" },
        { name: "Lotus Milkshake",    description: "Lotus biscuit blended into creamy indulgence.", priceLbp: 400000, imageUrl: "/images/products/LotusMilkshake.jpg", recipe: "Milk · Ice · Lotus" },
        { name: "Oliva Milkshake",    description: "Our secret house-special signature shake.",  priceLbp: 450000, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Oliva_Milkshake_product_card_202608020514-qPh6v5WQuuTulEgU7Emyiz1nVnQbmg.jpeg", recipe: "Milk · Ice · Oliva special mix" },
      ],
    },
    {
      id: "coffee-frappe", name: "Coffee Frappe", description: "Blended iced coffee indulgence", themeColor: "#92400e", accentColor: "#fdba74",
      imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_with_random_coffee_202607240435-Rqt8wvMWeMz7dwq7AGPXffMLOVnKpd.jpeg",
      products: [
        { name: "Mocha Frappe",    description: "Rich mocha blended with ice and cream.",     priceLbp: 350000, imageUrl: "/images/products/MochaFrappe.jpg",    recipe: "Double espresso · Cold whole milk · Chocolate sauce · Ice · Blended until smooth" },
        { name: "Caramel Frappe",  description: "Smooth caramel blended with ice and coffee.", priceLbp: 350000, imageUrl: "/images/products/CaramelFrappe.jpg",  recipe: "Double espresso · Cold whole milk · Caramel syrup · Ice · Blended until smooth" },
        { name: "Vanilla Frappe",  description: "Classic vanilla blended with ice and coffee.", priceLbp: 350000, imageUrl: "/images/products/VanillaFrappe.jpg", recipe: "Double espresso · Cold whole milk · Vanilla syrup · Ice · Blended until smooth" },
        { name: "Toffee Nut Frappe", description: "Toffee nut blended with ice and coffee.",  priceLbp: 450000, imageUrl: "/images/products/ToffeeNutFrappe.jpg",recipe: "Double espresso · Cold whole milk · Toffee-nut syrup · Ice · Blended until smooth" },
        { name: "Oliva Frappe",    description: "Our signature house-special frappe.",         priceLbp: 450000, imageUrl: "/images/products/OlivaFrappe.jpg",    recipe: "Double espresso · Cold whole milk · Oliva signature flavor · Ice · Blended until smooth" },
      ],
    },
    {
      id: "iced-latte", name: "Iced Latte", description: "Chilled espresso with cold milk", themeColor: "#0ea5e9", accentColor: "#7dd3fc",
      imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_cub_with_ice_latte_202607240436-pCXFkaQ79lJybuM2KEHZVqUlyIAJUW.jpeg",
      products: [
        { name: "Iced Spanish Latte",                          description: "Condensed milk sweetness over iced espresso.",      priceLbp: 400000, imageUrl: "/images/products/IcedSpanishLatte.jpg", recipe: "Double espresso · Cold whole milk · Sweetened condensed milk · Ice" },
        { name: "Iced Mocha Latte",                            description: "Chocolate and espresso over ice.",                  priceLbp: 400000, imageUrl: "/images/products/IcedMochaLatte.jpg",  recipe: "Double espresso · Cold whole milk · Chocolate sauce · Ice" },
        { name: "Iced Latte (Vanilla, Hazelnut, Salted Caramel)", description: "Choose your favorite flavor over ice.",         priceLbp: 300000, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Iced_Hazelnut_Latte_product_card_202608020513-WboajCiLFCT6MyUPVw06jG14enp3zF.jpeg", recipe: "Double espresso · Cold whole milk · Choice of: Vanilla syrup / Hazelnut syrup / Salted-caramel syrup · Ice", flavors: ["Vanilla", "Hazelnut", "Salted Caramel"] },
        { name: "Irish Cream Latte",                           description: "Irish cream flavor over iced espresso.",            priceLbp: 300000, imageUrl: "/images/products/IrishCreamLatte.jpg", recipe: "Double espresso · Cold whole milk · Non-alcoholic Irish-cream syrup · Ice" },
        { name: "Caramel Macchiato",                           description: "Vanilla and caramel over iced espresso.",          priceLbp: 300000, imageUrl: "/images/products/CaramelMacchiato.jpg",recipe: "Double espresso · Cold whole milk · Vanilla syrup · Caramel drizzle · Ice" },
        { name: "Iced Matcha Latte",                           description: "Stone-ground matcha whisked with cold milk.",      priceLbp: 350000, imageUrl: "/images/products/IcedMatchaLatte.jpg", recipe: "Matcha green tea · Cold whole milk · Light sweetener · Ice", flavors: ["Oat Milk", "Almond Milk", "Regular Milk"] },
      ],
    },
    {
      id: "refreshers", name: "Refreshers", description: "Cool, fruity, and refreshing", themeColor: "#0891b2", accentColor: "#67e8f9",
      imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_cubs_with_ice_tea_202607240439-nvfxQ18zvpbu66MPvhJBdGmXFLvIPq.jpeg",
      products: [
        { name: "Razzlychee Iced Tea", description: "Raspberry and lychee iced tea.",     priceLbp: 300000, imageUrl: "/images/products/RazzlycheeIcedTea.jpg", recipe: "Black tea · Raspberry flavor · Lychee flavor · Ice" },
        { name: "Tropical Iced Tea",   description: "Tropical fruit iced tea.",            priceLbp: 300000, imageUrl: "/images/products/TropicalIcedTea.jpg",  recipe: "Black tea · Tropical fruit flavors · Fruit syrup · Ice" },
        { name: "Peach Iced Tea",      description: "Refreshing peach iced tea.",          priceLbp: 300000, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Oliva_Caf%C3%A9_Peach_Iced_Tea_202608020511-AkNS4wnCFtsttU1Z4RnCk0mbyqy31Q.jpeg", recipe: "Black tea · Peach flavor · Light sweetener · Ice" },
        { name: "Kiwi Mojito",         description: "Kiwi and mint mocktail, crisp and cool.", priceLbp: 300000, imageUrl: "/images/products/KiwiMojito.jpg", recipe: "Kiwi · Fresh lime · Fresh mint · Sparkling water · Ice" },
        { name: "Passion Crush",       description: "Passion fruit crushed with ice.",     priceLbp: 300000, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hyEo5w3I433kY7LhTcXbkS1hPiqjYB.png", recipe: "Passion fruit · Fresh lime · Sparkling water · Crushed ice" },
        { name: "Summer Mix",          description: "A refreshing blend of summer fruits.", priceLbp: 300000, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-o91obZpOJCEwAWMd9n8anVLDsKXoqt.png", recipe: "Mixed summer fruits · Citrus juice · Sparkling water · Ice" },
      ],
    },
  ],
  "hot-drinks": [
    {
      id: "classic-hot", name: "Classic Hot Drinks", description: "Warm & aromatic classics", themeColor: "#b45309", accentColor: "#fdba74",
      imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/29484572558483377%20%281%29-1iER0hWvPNuvfPzzBs3dGVMmgG3dos.jpg",
      products: [
        { name: "Café Latte (Vanilla, Hazelnut)", description: "Smooth espresso with silky steamed milk.",     priceLbp: 300000, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Vanilla_Caf%C3%A9_Latte_product_card_202608020517-HwDA8UXqICt6eX69m3jbPZejMSF3zZ.jpeg", recipe: "Double espresso · Steamed whole milk · Choice of: Vanilla syrup / Hazelnut syrup · Thin velvety microfoam", flavors: ["Vanilla", "Hazelnut"] },
        { name: "Hot Chocolate",    description: "Rich dark cocoa with steamed milk and a touch of cream.", priceLbp: 300000, imageUrl: "/images/products/HotChocolate.jpg",  recipe: "Chocolate or cocoa · Steamed whole milk · Light milk foam · Whipped cream", flavors: ["Dark", "Milk", "White"] },
        { name: "Cappuccino",       description: "Velvety microfoam over a double espresso shot.",          priceLbp: 300000, imageUrl: "/images/products/Cappuccino.jpg",     recipe: "Double espresso · Steamed whole milk · Thick velvety microfoam · Equal parts espresso, milk and foam", flavors: ["Classic", "Wet", "Dry"] },
        { name: "Espresso",         description: "Rich single-origin shot, bold and intensely aromatic.",   priceLbp: 100000, imageUrl: "/images/products/Espresso.jpg",       recipe: "Freshly ground coffee · Hot water under pressure · Concentrated coffee shot · Natural crema", flavors: ["Single Shot", "Double Shot", "Ristretto"] },
        { name: "Tea",              description: "Fresh garden tea leaves steeped to perfection.",          priceLbp: 100000, imageUrl: "/images/products/GreenTea.jpg",        recipe: "Black tea leaves · Hot water · Sugar optional · Lemon optional", flavors: ["Black", "Green", "Mint"] },
        { name: "Ginger and Honey", description: "Warm ginger with soothing honey.",                       priceLbp: 150000, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Ginger_Honey_Hot_Drinks_202608020518-XRwfUalMAU0ev7pbUXncryeSSrGzHe.jpeg", recipe: "Fresh ginger · Hot water · Honey · Lemon optional", flavors: ["Fresh Ginger", "Ginger & Lemon", "Honey Ginger"] },
        { name: "Chamomile",        description: "Relaxing chamomile flowers steeped to calm.",             priceLbp: 150000, imageUrl: "/images/products/Chamomile.jpg",      recipe: "Chamomile flowers · Hot water · Honey optional", flavors: ["Pure Chamomile", "Chamomile & Honey", "Chamomile & Mint"] },
        { name: "Green Tea",        description: "Fresh green tea with natural antioxidants.",              priceLbp: 150000, imageUrl: "/images/products/GreenTea.jpg",        recipe: "Green tea leaves · Hot water · Honey optional", flavors: ["Pure Green", "Green & Jasmine", "Green & Honey"] },
      ],
    },
  ],
  "desserts": [
    {
      id: "cakes", name: "Cakes", description: "Freshly baked indulgence", themeColor: "#92400e", accentColor: "#fcd34d",
      imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-K6gUgR7LVIQfqfrhFECCbnXU5OSVjR.png",
      products: [
        { name: "Lazy Cake",       description: "No-bake indulgence with layers of flavor.",    priceLbp: 300000, imageUrl: "/images/products/LazyCake.jpg",       recipe: "Chocolate biscuits · Dark chocolate · Butter · Condensed milk · Cocoa powder · Crushed nuts · Chilled overnight", flavors: ["Classic", "Extra Chocolate", "With Nuts"] },
        { name: "Fondant",         description: "Warm chocolate center with delicious fondant.", priceLbp: 450000, imageUrl: "/images/products/Fondant.jpg",         recipe: "Dark chocolate · Butter · Eggs · Sugar · Flour · Baked 10 min at 200°C · Served warm with ice cream", flavors: ["Dark Chocolate", "Milk Chocolate", "White Chocolate"] },
        { name: "Chocolate Cake",  description: "Rich dark chocolate cake perfection.",          priceLbp: 450000, imageUrl: "/images/products/ChocolateCake.jpg",   recipe: "Dark chocolate sponge · Chocolate ganache layers · Belgian dark chocolate frosting · Cocoa dusting", flavors: ["Dark Chocolate", "Milk Chocolate", "With Ganache"] },
      ],
    },
    {
      id: "cheesecakes", name: "Cheesecakes", description: "Creamy and decadent", themeColor: "#be185d", accentColor: "#f9a8d4",
      imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Ho4AfGQ6PkQIz94Fxt02tPMtoALL1m.png",
      products: [
        { name: "Oreo Cheesecake",      description: "Creamy cheesecake with Oreo cookie crumble.",   priceLbp: 450000, imageUrl: "/images/products/OreoCheesecake.jpg",      recipe: "Oreo cookie crust · Cream cheese · Heavy cream · Sugar · Vanilla · Crushed Oreo topping · Chilled 4 hours", flavors: ["Classic Oreo", "Double Oreo", "Oreo & Vanilla"] },
        { name: "Raspberry Cheesecake", description: "Smooth cheesecake with fresh raspberry sauce.", priceLbp: 450000, imageUrl: "/images/products/RaspberryCheesecake.jpg", recipe: "Graham cracker crust · Cream cheese · Heavy cream · Sugar · Fresh raspberry coulis · Raspberry garnish", flavors: ["Fresh Raspberry", "Raspberry & Vanilla", "Triple Berry"] },
      ],
    },
    {
      id: "pastries", name: "Pastries", description: "Buttery and flaky", themeColor: "#15803d", accentColor: "#86efac",
      imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-8MQK5OawVbs0geKzCztMYmAE5FVBsZ.png",
      products: [
        { name: "Vanilla Mushroom Muffin",   description: "Soft vanilla muffin with mushroom top.",          priceLbp: 350000, imageUrl: "/images/products/VanillaMushroomMuffin.jpg",  recipe: "Flour · Sugar · Butter · Eggs · Vanilla extract · Milk · Baking powder · Vanilla buttercream topping", flavors: ["Pure Vanilla", "Vanilla & Chocolate Chips", "Vanilla & Berry"] },
        { name: "Chocolate Mushroom Muffin", description: "Rich chocolate muffin with mushroom crown.",      priceLbp: 350000, imageUrl: "/images/products/ChocolateMushroomMuffin.jpg", recipe: "Flour · Cocoa powder · Sugar · Butter · Eggs · Milk · Dark chocolate chips · Chocolate ganache crown", flavors: ["Dark Chocolate", "Chocolate & Hazelnut", "Chocolate & Almond"] },
        { name: "Croissant",                 description: "Flaky French-style croissant, baked fresh daily.", priceLbp: 250000, imageUrl: "/images/products/Croissant.jpg",              recipe: "Butter dough · Layered & folded 3 times · Proofed overnight · Egg-washed · Baked fresh every morning", flavors: ["Plain", "Chocolate", "Almond"] },
      ],
    },
  ],
  "shisha": [
    {
      id: "flavors", name: "Flavors", description: "All our premium selections", themeColor: "#a16207", accentColor: "#fcd34d", imageUrl: null,
      products: [
        { name: "Lemon Mint",   description: "Crisp lemon with cooling mint leaves.",        priceLbp: 500000, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-klpHNUnY3MwHeGKY7cAgyUCnpsvMwk.png" },
        { name: "Double Apple", description: "Classic dual apple flavor, sweet and smooth.", priceLbp: 500000, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bg1AzOAvlolWak7jtcGIl6Qo9Cw0yt.png" },
        { name: "Grape",        description: "Rich and sweet grape flavor.",                 priceLbp: 500000, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OYNiRMMx8o2JWCECpBiReXveE9b4YZ.png" },
        { name: "Tanbak",       description: "Strong traditional tobacco flavor.",           priceLbp: 700000, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jyDHjO5Wx9Z8uD1yNioltR69Ne0J5w.png" },
      ],
    },
  ],
  "sandwiches": [
    {
      id: "sandwiches-main", name: "Sandwiches", description: "Fresh & Delicious", themeColor: "#8b4513", accentColor: "#fbbf24", imageUrl: null,
      products: [
        { name: "Tuna Cado",           description: "Fresh tuna with creamy avocado.",          priceLbp: 450000, imageUrl: "/images/products/TunaCado.jpg",           recipe: "Tuna fillet · Ripe avocado · Lemon juice · Olive oil · Arugula · Sourdough bread · Sea salt & pepper" },
        { name: "Turkey and Cheese",   description: "Sliced turkey with melted cheese.",         priceLbp: 450000, imageUrl: "/images/products/TurkeyAndCheese.jpg",   recipe: "Smoked turkey breast · Melted cheddar · Lettuce · Tomato · Mustard mayo · Toasted ciabatta" },
        { name: "Hallum Pesto",        description: "Grilled halloumi with fresh pesto.",        priceLbp: 550000, imageUrl: "/images/products/HallumPesto.jpg",        recipe: "Grilled halloumi · Homemade basil pesto · Sun-dried tomatoes · Rocket leaves · Toasted sourdough" },
        { name: "Chicken Cesar Salad", description: "Grilled chicken with Caesar dressing.",     priceLbp: 600000, imageUrl: "/images/products/ChickenCaesarSalad.jpg", recipe: "Grilled chicken breast · Romaine lettuce · Parmesan shavings · Caesar dressing · Croutons · Ciabatta wrap" },
        { name: "Nuts",                description: "Mixed nuts and seeds blend.",               priceLbp: 250000, imageUrl: null,                                      recipe: "Roasted almonds · Cashews · Walnuts · Pistachios · Sunflower seeds · Light sea salt seasoning" },
      ],
    },
  ],
  "yogurt": [
    {
      id: "greek", name: "Greek Yogurt", description: "Smooth creamy Greek yogurt", themeColor: "#d946ef", accentColor: "#f9a8d4", imageUrl: null,
      products: [
        { name: "Greek Yogurt",       description: "Smooth and creamy Greek yogurt.",       priceLbp: 300000, imageUrl: "/images/products/GreekYogurt.jpg",       recipe: "Full-fat Greek yogurt · Honey drizzle · Optional: granola, walnuts, or fresh berries" },
        { name: "Mango Greek Yogurt", description: "Greek yogurt with fresh mango flavor.", priceLbp: 300000, imageUrl: "/images/products/MangoGreekYogurt.jpg", recipe: "Full-fat Greek yogurt · Fresh mango purée · Honey · Dried mango pieces · Optional coconut flakes" },
        { name: "Toppings",           description: "Granola, nuts, and fruit toppings.",    priceLbp: 100000, imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Oliva_Caf%C3%A9_toppings_product_card_202608020503-djFbXaz7xfnDVatZITOK4HARa6imMy.jpeg", recipe: "Homemade granola · Mixed nuts · Seasonal fresh fruit · Honey · Chia seeds" },
      ],
    },
  ],
  "padel": [
    {
      id: "padel-packages", name: "Court & Coaching", description: "Premium padel experiences", themeColor: "#06b6d4", accentColor: "#06f6d4", imageUrl: null,
      products: [
        { name: "1 Hour Court",          description: "Full hour of padel court play for up to 4 players",       priceLbp: 1800000, imageUrl: null, recipe: "Up to 4 players · Includes court lighting · Rackets available on request · Book in advance recommended" },
        { name: "1.5 Hours Court",       description: "Extended session with 1.5 hours of court time",           priceLbp: 2700000, imageUrl: null, recipe: "Up to 4 players · Includes court lighting · Ideal for longer matches or warm-up + play · Rackets available on request" },
        { name: "1 Hour Coaching",       description: "Professional padel coaching session for skill development", priceLbp: 2700000, imageUrl: null, recipe: "Certified padel coach · 1-on-1 or group (up to 4) · Technique, footwork & strategy · Suitable for all levels" },
        { name: "Premium Grip",          description: "High-quality grip tape for enhanced racket control",       priceLbp: 450000,  imageUrl: null, recipe: "Professional-grade grip tape · Non-slip texture · Moisture-absorbing · Easy self-apply · Available at the desk" },
        { name: "Professional Ball Set", description: "Pack of 3 official padel balls",                          priceLbp: 900000,  imageUrl: null, recipe: "Pack of 3 official padel balls · ITF approved · Pressurized for consistent bounce · Compatible with all court surfaces" },
      ],
    },
  ],
};

const DEFAULT_SETTINGS: Record<string, string> = {
  whatsapp_number: "+96171234567",
  whatsapp_message: "Hi! I'd like to book a padel court at Oliva.",
  exchange_rate_lbp_per_usd: String(RATE_PER_USD),
  exchange_rate_rounding: String(ROUNDING_TO),
  hero_headline_line1: "From Court",
  hero_headline_line2: "to Cup",
  hero_subline: "A grove, two courts, and the slowest afternoon you've ever had.",
  hero_eyebrow: "Padel · Café · Shisha",
  menu_promo_gallery: "[]",
};

// ─── Admin accounts ───────────────────────────────────────────────────────────
// The allowlist is server-only configuration. Passwords are never seeded.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
if (ADMIN_EMAILS.length !== 3 || new Set(ADMIN_EMAILS).size !== 3) {
  throw new Error("ADMIN_EMAILS must contain exactly three unique emails before seeding CMS admins");
}

/**
 * Admin accounts are created WITHOUT a password hash.
 * A one-time setup token is generated and stored ONLY in the database.
 * No token is ever printed to logs, stdout, or any observable output.
 *
 * The server operator retrieves tokens by querying the database directly:
 *   psql "$DATABASE_URL" -c \
 *     "SELECT email, setup_token FROM admin_users WHERE password_hash IS NULL;"
 *
 * Each admin then visits /#/admin → "Set Initial Password", enters their email
 * and setup token, and chooses a password. The token is single-use and cleared.
 *
 * Tokens are only visible to users with direct database access, never to
 * application users or through any API endpoint.
 */
async function seedAdmins() {
  console.log("Seeding admin accounts (passwordless — setup tokens stored in DB only)...");
  for (const email of ADMIN_EMAILS) {
    const existing = await db.select().from(adminUsersTable).where(eq(adminUsersTable.email, email));
    if (existing.length > 0) {
      const [user] = existing;
      if (user.passwordHash) {
        console.log(`  Admin ${email} — password already set, skipping.`);
      } else if (user.setupToken) {
        console.log(`  Admin ${email} — pending setup (retrieve token via DB query).`);
      } else {
        // Account exists but token was cleared and no password — regenerate token silently
        const token = randomBytes(32).toString("hex");
        await db.update(adminUsersTable).set({ setupToken: token }).where(eq(adminUsersTable.email, email));
        console.log(`  Admin ${email} — setup token regenerated (retrieve via DB query).`);
      }
      continue;
    }
    // New account — generate a setup token stored only in DB
    const token = randomBytes(32).toString("hex");
    await db.insert(adminUsersTable).values({ email, passwordHash: null, setupToken: token });
    console.log(`  Created admin: ${email} (retrieve setup token via DB query).`);
  }
  console.log("");
  console.log("  To retrieve setup tokens for unclaimed accounts:");
  console.log("    psql \"$DATABASE_URL\" -c \"SELECT email, setup_token FROM admin_users WHERE password_hash IS NULL;\"");
  console.log("");
}

async function seedSections() {
  console.log("Seeding sections...");
  for (const section of SECTIONS) {
    const existing = await db.select({ id: cmsSectionsTable.id }).from(cmsSectionsTable).where(eq(cmsSectionsTable.slug, section.slug));
    if (existing.length > 0) { console.log(`  Section '${section.slug}' already exists.`); continue; }
    await db.insert(cmsSectionsTable).values(section);
    console.log(`  Created section: ${section.slug}`);
  }
}

async function seedSubcategoriesAndProducts() {
  console.log("Seeding subcategories and products...");
  for (const [sectionSlug, subs] of Object.entries(SUBCATEGORIES)) {
    for (let si = 0; si < subs.length; si++) {
      const sub = subs[si];
      const existingSub = await db.select({ id: cmsSubcategoriesTable.id }).from(cmsSubcategoriesTable)
        .where(and(eq(cmsSubcategoriesTable.sectionSlug, sectionSlug), eq(cmsSubcategoriesTable.subcategoryId, sub.id)));
      let subDbId: number;
      if (existingSub.length > 0) {
        console.log(`  Subcategory '${sub.id}' already exists.`);
        subDbId = existingSub[0].id;
      } else {
        const [inserted] = await db.insert(cmsSubcategoriesTable).values({
          sectionSlug, subcategoryId: sub.id, name: sub.name, description: sub.description,
          themeColor: sub.themeColor, accentColor: sub.accentColor, imageUrl: sub.imageUrl ?? null, sortOrder: si,
        }).returning({ id: cmsSubcategoriesTable.id });
        subDbId = inserted.id;
        console.log(`  Created subcategory: ${sub.name}`);
      }
      for (let pi = 0; pi < sub.products.length; pi++) {
        const p = sub.products[pi];
        const existingProd = await db.select({ id: cmsProductsTable.id }).from(cmsProductsTable)
          .where(and(eq(cmsProductsTable.subcategoryDbId, subDbId), eq(cmsProductsTable.name, p.name)));
        if (existingProd.length > 0) continue;
        await db.insert(cmsProductsTable).values({
          subcategoryDbId: subDbId, name: p.name,
          shortName: p.shortName ?? p.name.split(" ")[0].toUpperCase(),
          description: p.description, priceLbp: p.priceLbp, priceUsd: computeUsd(p.priceLbp),
          imageUrl: p.imageUrl ?? null, recipe: p.recipe ?? "", flavors: p.flavors ?? [],
          calories: p.calories ?? seedCalories(p.name),
          extraCalories: p.extraCalories ?? seedExtraCalories(sub.id),
          sortOrder: pi,
        });
        console.log(`    Created product: ${p.name}`);
      }
    }
  }
}

async function seedSettings() {
  console.log("Seeding site settings...");
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.insert(cmsSiteSettingsTable).values({ key, value }).onConflictDoNothing();
  }
}

async function createInitialRelease() {
  const existing = await db.select({ id: cmsReleasesTable.id }).from(cmsReleasesTable).limit(1);
  if (existing.length > 0) { console.log("Initial release already exists."); return; }
  console.log("Creating initial published release...");
  const sections = await db.select().from(cmsSectionsTable);
  const subcategories = await db.select().from(cmsSubcategoriesTable);
  const products = await db.select().from(cmsProductsTable);
  const settingsRows = await db.select().from(cmsSiteSettingsTable);
  const sectionShapes = sections.map((s) => ({
    ...s, subcategories: subcategories.filter((sub) => sub.sectionSlug === s.slug && !sub.deleted).map((sub) => ({
      ...sub, imageUrl: sub.imageUrl ?? null, createdAt: sub.createdAt.toISOString(), updatedAt: sub.updatedAt.toISOString(),
      products: products.filter((p) => p.subcategoryDbId === sub.id && !p.deleted).map((p) => ({
        ...p, flavors: (p.flavors as string[]) ?? [], imageUrl: p.imageUrl ?? null, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString(),
      })),
    })),
  }));
  await db.insert(cmsReleasesTable).values({
    label: "Initial import", snapshot: { sections: sectionShapes, settings: Object.fromEntries(settingsRows.map((r) => [r.key, r.value])), publishedAt: new Date().toISOString() },
    publishedBy: "system", isCurrent: true,
  });
  console.log("Initial release created.");
}

async function main() {
  console.log("Starting CMS seed...\n");
  await seedAdmins();
  await seedSections();
  await seedSubcategoriesAndProducts();
  await seedSettings();
  await createInitialRelease();
  console.log("\nSeed complete!");
}

main().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
