export interface SubcategoryDrink {
  name: string
  description: string
  price: string
  lbpPrice: string
  image: string | null
  recipe?: string
}

export interface Subcategory {
  id: string
  name: string
  description: string
  themeColor: string
  accentColor: string
  drinks: SubcategoryDrink[]
  image?: string | null
}

export const coldDrinksSubcategories: Subcategory[] = [
  {
    id: 'smoothies',
    name: 'Smoothies',
    description: 'Fresh fruit blended to perfection',
    themeColor: '#16a34a',
    accentColor: '#86efac',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Style_of_cub_cold_drink_202607240431-TrhRjFxd4wxoAx2gsQCFMQNxRLCWI3.jpeg',
    drinks: [
      { name: 'Foral Fusion', description: 'A vibrant blend of fresh fruit flavors.', price: '$3.50', lbpPrice: '300,000 LBP', image: '/floral-fusion.png', recipe: 'Mixed fruits · Fruit juice · Floral flavor · Ice' },
      { name: 'Mango', description: 'Ripe mango blended to perfection.', price: '$3.50', lbpPrice: '300,000 LBP', image: '/mango-smoothie.png', recipe: 'Mango · Fruit juice · Ice' },
      { name: 'Strawberry', description: 'Fresh strawberries, creamy and sweet.', price: '$3.50', lbpPrice: '300,000 LBP', image: '/strawberry-smoothie.png', recipe: 'Strawberries · Fruit juice · Ice' },
      { name: 'Passion Fruit', description: 'Tropical passion fruit, tangy and refreshing.', price: '$3.50', lbpPrice: '300,000 LBP', image: '/passion-fruit-smoothie.png', recipe: 'Passion fruit · Fruit juice · Ice' },
    ],
  },
  {
    id: 'milk-shake',
    name: 'Milkshakes',
    description: 'Thick, creamy, and indulgent',
    themeColor: '#d97706',
    accentColor: '#fcd34d',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_cub_with_milkshakes_202607240432-DyeXQYjJj3Qg2lXxkb8gT9y7V0T2mz.jpeg',
    drinks: [
      { name: 'Cookies & Cream', description: 'Crushed cookies blended into silky cream.', price: '$4.50', lbpPrice: '400,000 LBP', image: '/cookies-cream-milkshake.png', recipe: 'Vanilla ice cream · Cold whole milk · Crushed Oreo cookies · Chocolate sauce' },
      { name: 'Strawberry Whip', description: 'Fresh strawberries with whipped cream.', price: '$4', lbpPrice: '350,000 LBP', image: '/images/products/StrawberryWhip.jpg', recipe: 'Vanilla ice cream · Cold whole milk · Strawberry purée · Whipped cream' },
      { name: 'Choco-Nut Milkshake', description: 'Chocolate and nut blend, rich and creamy.', price: '$4', lbpPrice: '350,000 LBP', image: '/images/products/ChocoNutMilkshake.jpg', recipe: 'Vanilla ice cream · Cold whole milk · Chocolate · Hazelnut flavor' },
      { name: 'Vanilla Milkshake', description: 'Classic vanilla bean milkshake.', price: '$4', lbpPrice: '350,000 LBP', image: '/images/products/VanillaMilkshake.jpg', recipe: 'Vanilla ice cream · Cold whole milk · Vanilla flavor' },
      { name: 'Lotus Milkshake', description: 'Lotus biscuit blended into creamy indulgence.', price: '$4.50', lbpPrice: '400,000 LBP', image: '/images/products/LotusMilkshake.jpg', recipe: 'Vanilla ice cream · Cold whole milk · Lotus Biscoff spread · Crushed Lotus biscuits' },
      { name: 'Oliva Milkshake', description: 'Our secret house-special signature shake.', price: '$5', lbpPrice: '450,000 LBP', image: '/images/products/OlivaMilkshake.jpg', recipe: '????? try it and find out' },
    ],
  },
  {
    id: 'coffee-frappe',
    name: 'Coffee Frappe',
    description: 'Blended iced coffee indulgence',
    themeColor: '#92400e',
    accentColor: '#fdba74',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_with_random_coffee_202607240435-Rqt8wvMWeMz7dwq7AGPXffMLOVnKpd.jpeg',
    drinks: [
      { name: 'Mocha Frappe', description: 'Rich mocha blended with ice and cream.', price: '$4', lbpPrice: '350,000 LBP', image: '/images/products/MochaFrappe.jpg', recipe: 'Double espresso · Cold whole milk · Chocolate sauce · Ice · Blended until smooth' },
      { name: 'Caramel Frappe', description: 'Smooth caramel blended with ice and coffee.', price: '$4', lbpPrice: '350,000 LBP', image: '/images/products/CaramelFrappe.jpg', recipe: 'Double espresso · Cold whole milk · Caramel syrup · Ice · Blended until smooth' },
      { name: 'Vanilla Frappe', description: 'Classic vanilla blended with ice and coffee.', price: '$4', lbpPrice: '350,000 LBP', image: '/images/products/VanillaFrappe.jpg', recipe: 'Double espresso · Cold whole milk · Vanilla syrup · Ice · Blended until smooth' },
      { name: 'Toffee Nut Frappe', description: 'Toffee nut blended with ice and coffee.', price: '$5', lbpPrice: '450,000 LBP', image: '/images/products/ToffeeNutFrappe.jpg', recipe: 'Double espresso · Cold whole milk · Toffee-nut syrup · Ice · Blended until smooth' },
      { name: 'Oliva Frappe', description: 'Our signature house-special frappe.', price: '$5', lbpPrice: '450,000 LBP', image: '/images/products/OlivaFrappe.jpg', recipe: 'Double espresso · Cold whole milk · Oliva signature flavor · Ice · Blended until smooth' },
    ],
  },
  {
    id: 'iced-latte',
    name: 'Iced Latte',
    description: 'Chilled espresso with cold milk',
    themeColor: '#0ea5e9',
    accentColor: '#7dd3fc',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_cub_with_ice_latte_202607240436-pCXFkaQ79lJybuM2KEHZVqUlyIAJUW.jpeg',
    drinks: [
      { name: 'Iced Spanish Latte', description: 'Condensed milk sweetness over iced espresso.', price: '$3.50', lbpPrice: '400,000 LBP', image: '/images/products/IcedSpanishLatte.jpg', recipe: 'Double espresso · Cold whole milk · Sweetened condensed milk · Ice' },
      { name: 'Iced Mocha Latte', description: 'Chocolate and espresso over ice.', price: '$3.50', lbpPrice: '400,000 LBP', image: '/images/products/IcedMochaLatte.jpg', recipe: 'Double espresso · Cold whole milk · Chocolate sauce · Ice' },
      { name: 'Iced Latte (Vanilla, Hazelnut, Salted Caramel)', description: 'Choose your favorite flavor over ice.', price: '$3.50', lbpPrice: '300,000 LBP', image: '/images/products/IcedMatcha Latte.jpg', recipe: 'Double espresso · Cold whole milk · Choice of: Vanilla syrup / Hazelnut syrup / Salted-caramel syrup · Ice' },
      { name: 'Irish Cream Latte', description: 'Irish cream flavor over iced espresso.', price: '$3.50', lbpPrice: '300,000 LBP', image: '/images/products/IrishCreamLatte.jpg', recipe: 'Double espresso · Cold whole milk · Non-alcoholic Irish-cream syrup · Ice' },
      { name: 'Caramel Macchiato', description: 'Vanilla and caramel over iced espresso.', price: '$3.50', lbpPrice: '300,000 LBP', image: '/images/products/CaramelMacchiato.jpg', recipe: 'Double espresso · Cold whole milk · Vanilla syrup · Caramel drizzle · Ice' },
      { name: 'Iced Matcha Latte', description: 'Stone-ground matcha whisked with cold milk.', price: '$4', lbpPrice: '350,000 LBP', image: '/images/products/IcedMatchaLatte.jpg', recipe: 'Matcha green tea · Cold whole milk · Light sweetener · Ice' },
    ],
  },
  {
    id: 'refreshers',
    name: 'Refreshers',
    description: 'Cool, fruity, and refreshing',
    themeColor: '#0891b2',
    accentColor: '#67e8f9',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_cubs_with_ice_tea_202607240439-nvfxQ18zvpbu66MPvhJBdGmXFLvIPq.jpeg',
    drinks: [
      { name: 'Razzlychee Iced Tea', description: 'Raspberry and lychee iced tea.', price: '$3', lbpPrice: '300,000 LBP', image: '/images/products/RazzlycheeIcedTea.jpg', recipe: 'Black tea · Raspberry flavor · Lychee flavor · Ice' },
      { name: 'Tropical Iced Tea', description: 'Tropical fruit iced tea.', price: '$3', lbpPrice: '300,000 LBP', image: '/images/products/TropicalIcedTea.jpg', recipe: 'Black tea · Tropical fruit flavors · Fruit syrup · Ice' },
      { name: 'Peach Iced Tea', description: 'Refreshing peach iced tea.', price: '$3', lbpPrice: '300,000 LBP', image: '/images/products/PeachIcedTea.jpg', recipe: 'Black tea · Peach flavor · Light sweetener · Ice' },
      { name: 'Kiwi Mojito', description: 'Kiwi and mint mocktail, crisp and cool.', price: '$3', lbpPrice: '300,000 LBP', image: '/images/products/KiwiMojito.jpg', recipe: 'Kiwi · Fresh lime · Fresh mint · Sparkling water · Ice' },
      { name: 'Passion Crush', description: 'Passion fruit crushed with ice.', price: '$3.50', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hyEo5w3I433kY7LhTcXbkS1hPiqjYB.png', recipe: 'Passion fruit · Fresh lime · Sparkling water · Crushed ice' },
      { name: 'Summer Mix', description: 'A refreshing blend of summer fruits.', price: '$3.50', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-o91obZpOJCEwAWMd9n8anVLDsKXoqt.png', recipe: 'Mixed summer fruits · Citrus juice · Sparkling water · Ice' },
    ],
  },
]

export const hotDrinksSubcategories: Subcategory[] = [
  {
    id: 'classic-hot',
    name: 'Classic Hot Drinks',
    description: 'Warm & aromatic classics',
    themeColor: '#b45309',
    accentColor: '#fdba74',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/29484572558483377%20%281%29-1iER0hWvPNuvfPzzBs3dGVMmgG3dos.jpg',
    drinks: [
      { name: 'Café Latte (Vanilla, Hazelnut)', description: 'Smooth espresso with silky steamed milk.', price: '$3', lbpPrice: '300,000 LBP', image: '/images/products/CaféLatte.jpg', recipe: 'Double espresso · Steamed whole milk · Choice of: Vanilla syrup / Hazelnut syrup · Thin velvety microfoam' },
      { name: 'Hot Chocolate', description: 'Rich dark cocoa with steamed milk and a touch of cream.', price: '$3', lbpPrice: '300,000 LBP', image: '/images/products/HotChocolate.jpg', recipe: 'Chocolate or cocoa · Steamed whole milk · Light milk foam · Whipped cream' },
      { name: 'Cappuccino', description: 'Velvety microfoam over a double espresso shot.', price: '$3', lbpPrice: '300,000 LBP', image: '/images/products/Cappuccino.jpg', recipe: 'Double espresso · Steamed whole milk · Thick velvety microfoam · Equal parts espresso, milk and foam' },
      { name: 'Espresso', description: 'Rich single-origin shot, bold and intensely aromatic.', price: '$1.50', lbpPrice: '100,000 LBP', image: '/images/products/Espresso.jpg', recipe: 'Freshly ground coffee · Hot water under pressure · Concentrated coffee shot · Natural crema' },
      { name: 'Tea', description: 'Fresh garden tea leaves steeped to perfection.', price: '$1.50', lbpPrice: '100,000 LBP', image: '/images/products/GreenTea.jpg', recipe: 'Black tea leaves · Hot water · Sugar optional · Lemon optional' },
      { name: 'Ginger and Honey', description: 'Warm ginger with soothing honey.', price: '$1.50', lbpPrice: '150,000 LBP', image: '/images/products/GingerAndHoney.jpg', recipe: 'Fresh ginger · Hot water · Honey · Lemon optional' },
      { name: 'Chamomile', description: 'Relaxing chamomile flowers steeped to calm.', price: '$1.50', lbpPrice: '150,000 LBP', image: '/images/products/Chamomile.jpg', recipe: 'Chamomile flowers · Hot water · Honey optional' },
      { name: 'Green Tea', description: 'Fresh green tea with natural antioxidants.', price: '$1.50', lbpPrice: '150,000 LBP', image: '/images/products/GreenTea.jpg', recipe: 'Green tea leaves · Hot water · Honey optional' },
    ],
  },
]

export const dessertsSubcategories: Subcategory[] = [
  {
    id: 'cakes',
    name: 'Cakes',
    description: 'Freshly baked indulgence',
    themeColor: '#92400e',
    accentColor: '#fcd34d',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-K6gUgR7LVIQfqfrhFECCbnXU5OSVjR.png',
    drinks: [
      { name: 'Lazy Cake', description: 'No-bake indulgence with layers of flavor.', price: '$3.50', lbpPrice: '300,000 LBP', image: '/images/products/LazyCake.jpg', recipe: 'Chocolate biscuits · Dark chocolate · Butter · Condensed milk · Cocoa powder · Crushed nuts · Chilled overnight' },
      { name: 'Fondant', description: 'Warm chocolate center with delicious fondant.', price: '$5', lbpPrice: '450,000 LBP', image: '/images/products/Fondant.jpg', recipe: 'Dark chocolate · Butter · Eggs · Sugar · Flour · Baked 10 min at 200°C · Served warm with ice cream' },
      { name: 'Chocolate Cake', description: 'Rich dark chocolate cake perfection.', price: '$5', lbpPrice: '450,000 LBP', image: '/images/products/ChocolateCake.jpg', recipe: 'Dark chocolate sponge · Chocolate ganache layers · Belgian dark chocolate frosting · Cocoa dusting' },
    ],
  },
  {
    id: 'cheesecakes',
    name: 'Cheesecakes',
    description: 'Creamy and decadent',
    themeColor: '#be185d',
    accentColor: '#f9a8d4',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Ho4AfGQ6PkQIz94Fxt02tPMtoALL1m.png',
    drinks: [
      { name: 'Oreo Cheesecake', description: 'Creamy cheesecake with Oreo cookie crumble.', price: '$5', lbpPrice: '450,000 LBP', image: '/images/products/OreoCheesecake.jpg', recipe: 'Oreo cookie crust · Cream cheese · Heavy cream · Sugar · Vanilla · Crushed Oreo topping · Chilled 4 hours' },
      { name: 'Raspberry Cheesecake', description: 'Smooth cheesecake with fresh raspberry sauce.', price: '$5', lbpPrice: '450,000 LBP', image: '/images/products/RaspberryCheesecake.jpg', recipe: 'Graham cracker crust · Cream cheese · Heavy cream · Sugar · Fresh raspberry coulis · Raspberry garnish' },
    ],
  },
  {
    id: 'pastries',
    name: 'Pastries',
    description: 'Buttery and flaky',
    themeColor: '#15803d',
    accentColor: '#86efac',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-8MQK5OawVbs0geKzCztMYmAE5FVBsZ.png',
    drinks: [
      { name: 'Vanilla Mushroom Muffin', description: 'Soft vanilla muffin with mushroom top.', price: '$4', lbpPrice: '350,000 LBP', image: '/images/products/VanillaMushroomMuffin.jpg', recipe: 'Flour · Sugar · Butter · Eggs · Vanilla extract · Milk · Baking powder · Vanilla buttercream topping' },
      { name: 'Chocolate Mushroom Muffin', description: 'Rich chocolate muffin with mushroom crown.', price: '$4', lbpPrice: '350,000 LBP', image: '/images/products/ChocolateMushroomMuffin.jpg', recipe: 'Flour · Cocoa powder · Sugar · Butter · Eggs · Milk · Dark chocolate chips · Chocolate ganache crown' },
      { name: 'Croissant', description: 'Flaky French-style croissant, baked fresh daily.', price: '$3', lbpPrice: '250,000 LBP', image: '/images/products/Croissant.jpg', recipe: 'Butter dough · Layered & folded 3 times · Proofed overnight · Egg-washed · Baked fresh every morning' },
    ],
  },
]

export const shishaSubcategories: Subcategory[] = [
  {
    id: 'flavors',
    name: 'Flavors',
    description: 'All our premium selections',
    themeColor: '#a16207',
    accentColor: '#fcd34d',
    drinks: [
      { name: 'Lemon Mint', description: 'Crisp lemon with cooling mint leaves.', price: '$5.50', lbpPrice: '500,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-klpHNUnY3MwHeGKY7cAgyUCnpsvMwk.png' },
      { name: 'Double Apple', description: 'Classic dual apple flavor, sweet and smooth.', price: '$5.50', lbpPrice: '500,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bg1AzOAvlolWak7jtcGIl6Qo9Cw0yt.png' },
      { name: 'Grape', description: 'Rich and sweet grape flavor.', price: '$5.50', lbpPrice: '500,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OYNiRMMx8o2JWCECpBiReXveE9b4YZ.png' },
      { name: 'Tanbak', description: 'Strong traditional tobacco flavor.', price: '$7.50', lbpPrice: '700,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jyDHjO5Wx9Z8uD1yNioltR69Ne0J5w.png' },
    ],
  },
]

export const sandwichesSubcategories: Subcategory[] = [
  {
    id: 'sandwiches-main',
    name: 'Sandwiches',
    description: 'Fresh & Delicious',
    themeColor: '#8b4513',
    accentColor: '#fbbf24',
    drinks: [
      { name: 'Tuna Cado', description: 'Fresh tuna with creamy avocado.', price: '$5', lbpPrice: '450,000 LBP', image: '/images/products/TunaCado.jpg', recipe: 'Tuna fillet · Ripe avocado · Lemon juice · Olive oil · Arugula · Sourdough bread · Sea salt & pepper' },
      { name: 'Turkey and Cheese', description: 'Sliced turkey with melted cheese.', price: '$5', lbpPrice: '450,000 LBP', image: '/images/products/TurkeyAndCheese.jpg', recipe: 'Smoked turkey breast · Melted cheddar · Lettuce · Tomato · Mustard mayo · Toasted ciabatta' },
      { name: 'Hallum Pesto', description: 'Grilled halloumi with fresh pesto.', price: '$6', lbpPrice: '550,000 LBP', image: '/images/products/HallumPesto.jpg', recipe: 'Grilled halloumi · Homemade basil pesto · Sun-dried tomatoes · Rocket leaves · Toasted sourdough' },
      { name: 'Chicken Cesar Salad', description: 'Grilled chicken with Caesar dressing.', price: '$6.50', lbpPrice: '600,000 LBP', image: '/images/products/ChickenCaesarSalad.jpg', recipe: 'Grilled chicken breast · Romaine lettuce · Parmesan shavings · Caesar dressing · Croutons · Ciabatta wrap' },
      { name: 'Nuts', description: 'Mixed nuts and seeds blend.', price: '$2.50', lbpPrice: '250,000 LBP', image: null, recipe: 'Roasted almonds · Cashews · Walnuts · Pistachios · Sunflower seeds · Light sea salt seasoning' },
    ],
  },
]

export const yogurtSubcategories: Subcategory[] = [
  {
    id: 'greek',
    name: 'Greek Yogurt',
    description: 'Smooth creamy Greek yogurt',
    themeColor: '#d946ef',
    accentColor: '#f9a8d4',
    drinks: [
      { name: 'Greek Yogurt', description: 'Smooth and creamy Greek yogurt.', price: '$3', lbpPrice: '300,000 LBP', image: '/images/products/GreekYogurt.jpg', recipe: 'Full-fat Greek yogurt · Honey drizzle · Optional: granola, walnuts, or fresh berries' },
      { name: 'Mango Greek Yogurt', description: 'Greek yogurt with fresh mango flavor.', price: '$3', lbpPrice: '300,000 LBP', image: '/images/products/MangoGreekYogurt.jpg', recipe: 'Full-fat Greek yogurt · Fresh mango purée · Honey · Dried mango pieces · Optional coconut flakes' },
      { name: 'Toppings', description: 'Granola, nuts, and fruit toppings.', price: '$1', lbpPrice: '100,000 LBP', image: null, recipe: 'Homemade granola · Mixed nuts · Seasonal fresh fruit · Honey · Chia seeds' },
    ],
  },
]

export const padelSubcategories: Subcategory[] = [
  {
    id: 'padel-packages',
    name: 'Court & Coaching',
    description: 'Premium padel experiences',
    themeColor: '#06b6d4',
    accentColor: '#06f6d4',
    drinks: [
      { name: '1 Hour Court', description: 'Full hour of padel court play for up to 4 players', price: '$20', lbpPrice: '1,800,000 LBP', image: null, recipe: 'Up to 4 players · Includes court lighting · Rackets available on request · Book in advance recommended' },
      { name: '1.5 Hours Court', description: 'Extended session with 1.5 hours of court time', price: '$30', lbpPrice: '2,700,000 LBP', image: null, recipe: 'Up to 4 players · Includes court lighting · Ideal for longer matches or warm-up + play · Rackets available on request' },
      { name: '1 Hour Coaching', description: 'Professional padel coaching session for skill development', price: '$30', lbpPrice: '2,700,000 LBP', image: null, recipe: 'Certified padel coach · 1-on-1 or group (up to 4) · Technique, footwork & strategy · Suitable for all levels' },
      { name: 'Premium Grip', description: 'High-quality grip tape for enhanced racket control', price: '$5', lbpPrice: '450,000 LBP', image: null, recipe: 'Professional-grade grip tape · Non-slip texture · Moisture-absorbing · Easy self-apply · Available at the desk' },
      { name: 'Professional Ball Set', description: 'Pack of 3 official padel balls', price: '$9.99', lbpPrice: '900,000 LBP', image: null, recipe: 'Pack of 3 official padel balls · ITF approved · Pressurized for consistent bounce · Compatible with all court surfaces' },
    ],
  },
]

export const subcategoryData: Record<string, Subcategory[]> = {
  'cold-drinks': coldDrinksSubcategories,
  'hot-drinks': hotDrinksSubcategories,
  'desserts': dessertsSubcategories,
  'shisha': shishaSubcategories,
  'sandwiches': sandwichesSubcategories,
  'yogurt': yogurtSubcategories,
  'padel': padelSubcategories,
}
