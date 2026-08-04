export interface SubcategoryDrink {
  name: string
  description: string
  price: string
  lbpPrice: string
  image: string | null
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
      { name: 'Foral Fusion', description: 'A vibrant blend of fresh fruit flavors.', price: '$3.50', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Remove_cub_keep_berry_202607240514-HSn503Mf9tacmA8abgIBzX6GJZV2aA.jpeg' },
      { name: 'Mango', description: 'Ripe mango blended to perfection.', price: '$3.50', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_with_mango_smoothies_202607240514-6etjX8dIMf211zgwAI0qADkDRfXIYK.jpeg' },
      { name: 'Strawberry', description: 'Fresh strawberries, creamy and sweet.', price: '$3.50', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_with_strawberry_smoothies_202607240515-ErzxOqHxsILoXGGWoxfURuwvjKOfLR.jpeg' },
      { name: 'Passion Fruit', description: 'Tropical passion fruit, tangy and refreshing.', price: '$3.50', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_with_passion_fruit_smoothie_202607240515-gcFfTy9CTasTxniOrouIbIFZszEfSE.jpeg' },
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
      { name: 'Cookies & Cream', description: 'Crushed cookies blended into silky cream.', price: '$4.50', lbpPrice: '400,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Make_cookies_brown_not_oreo_202607240518-iKktANVkffo9wb6QbbcuqxY2ChOrwx.jpeg' },
      { name: 'Strawberry Whip', description: 'Fresh strawberries with whipped cream.', price: '$4', lbpPrice: '350,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Strawberry_whip_milkshakes_202607240519-XGTJ17Ap1la3ozcF0mlFK2Y7N9HQqZ.jpeg' },
      { name: 'Choco-Nut Milkshake', description: 'Chocolate and nut blend, rich and creamy.', price: '$4', lbpPrice: '350,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_with_choco_nut_202607240519-6mC8PWh61UYLCgVfOb8SdAZVcD0oJo.jpeg' },
      { name: 'Vanilla Milkshake', description: 'Classic vanilla bean milkshake.', price: '$4', lbpPrice: '350,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_with_vanilla_milkshakes_202607240520-CSxRiddqcNF8XKDMaS0NDdhwTaSgYp.jpeg' },
      { name: 'Lotus Milkshake', description: 'Lotus biscuit blended into creamy indulgence.', price: '$4.50', lbpPrice: '400,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_with_lotus_milkshake_202607240521-VWPZhDpaqRMBGqeEMWZyjAZrVKWVQA.jpeg' },
      { name: 'Oliva Milkshake', description: '??????????????', price: '$5', lbpPrice: '450,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Make_drink_sooooo_blur_202607240524-oqfptwROqTmiIQ6F4op2kh9LR8JRA6.jpeg' },
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
      { name: 'Mocha Frappe', description: 'Rich mocha blended with ice and cream.', price: '$4', lbpPrice: '350,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-BQDkBVR6vWGnbaHOj7SOW5NopJgyKD.png' },
      { name: 'Caramel Frappe', description: 'Smooth caramel blended with ice and coffee.', price: '$4', lbpPrice: '350,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DD355iO6F299UbnMlZ1HbkfhQNt4Sd.png' },
      { name: 'Vanilla Frappe', description: 'Classic vanilla blended with ice and coffee.', price: '$4', lbpPrice: '350,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Q3TPoUv7PqvQEPzIy7QPORCPPdjfeg.png' },
      { name: 'Toffee Nut Frappe', description: 'Toffee nut blended with ice and coffee.', price: '$5', lbpPrice: '450,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-V92sw4jPopFJUhY0I6CRopiMhJPd3z.png' },
      { name: 'Oliva Frappe', description: 'Our signature house-special frappe.', price: '$5', lbpPrice: '450,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bbYGextJha6eEyKhj4PdXN57IHwUl6.png' },
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
      { name: 'Iced Spanish Latte', description: 'Condensed milk sweetness over iced espresso.', price: '$3.50', lbpPrice: '400,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-1A9jSkBMZQQTChO85ByHAFjMXR4xFl.png' },
      { name: 'Iced Mocha Latte', description: 'Chocolate and espresso over ice.', price: '$3.50', lbpPrice: '400,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Rr4c9LxQmhblzgfiYOvwxMvOIKa6hl.png' },
      { name: 'Iced Latte (Vanilla, Hazelnut, Salted Caramel)', description: 'Choose your favorite flavor over ice.', price: '$3.50', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-xTfJ6LFapgpfO1LyhDQWMhHXu9DWu6.png' },
      { name: 'Irish Cream Latte', description: 'Irish cream flavor over iced espresso.', price: '$3.50', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9SNq0XJxkj4jDX9BPJYdhro9oBkYfR.png' },
      { name: 'Caramel Macchiato', description: 'Vanilla and caramel over iced espresso.', price: '$3.50', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EzCxMy5OY10OgFIMIO6yp3aNpJLNMS.png' },
      { name: 'Iced Matcha Latte', description: 'Stone-ground matcha whisked with cold milk.', price: '$4', lbpPrice: '350,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-KEVrxkxgtVF8BYCASuyNzMyJQ9PKK0.png' },
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
      { name: 'Razzlychee Iced Tea', description: 'Raspberry and lychee iced tea.', price: '$3', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bRQLbVsikSW2ZWnjqH1VSWWdS4xUdP.png' },
      { name: 'Tropical Iced Tea', description: 'Tropical fruit iced tea.', price: '$3', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7i5TcZR6dEALoXdeObmDp45KOg9wU4.png' },
      { name: 'Peach Iced Tea', description: 'Refreshing peach iced tea.', price: '$3', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-8HJ5G3p17tU3Vt5uYpASaP3IpI7Lac.png' },
      { name: 'Kiwi Mojito', description: 'Kiwi and mint mocktail, crisp and cool.', price: '$3', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-5rt87GEZDjmTtPCUeSwUExpuGr1KmZ.png' },
      { name: 'Passion Crush', description: 'Passion fruit crushed with ice.', price: '$3.50', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-hyEo5w3I433kY7LhTcXbkS1hPiqjYB.png' },
      { name: 'Summer Mix', description: 'A refreshing blend of summer fruits.', price: '$3.50', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-o91obZpOJCEwAWMd9n8anVLDsKXoqt.png' },
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
      { name: 'Café Latte (Vanilla, Hazelnut)', description: 'Smooth espresso with silky steamed milk.', price: '$3', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_drink_with_cafe_latte_202607232038-sILwH2u7ucm7zxNQAC2O01CToZpFtE.jpeg' },
      { name: 'Hot Chocolate', description: 'Rich dark cocoa with steamed milk and a touch of cream.', price: '$3', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_cub_with_hot_chocolat_202607232038-ITId7cFtZGHzdKXocxmd6zYk8ZaNbA.jpeg' },
      { name: 'Cappuccino', description: 'Velvety microfoam over a double espresso shot.', price: '$3', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_cub_design_with_white_202607232112-q3frxaTSt5VAZ2p4JNC9ZchDWhvYS9.jpeg' },
      { name: 'Espresso', description: 'Rich single-origin shot, bold and intensely aromatic.', price: '$1.50', lbpPrice: '100,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Replace_cub_with_espresso_cub_202607232041-DuTLgmfeNonKK3t469sh1OztnIlMS8.jpeg' },
      { name: 'Tea', description: 'Fresh garden tea leaves steeped to perfection.', price: '$1.50', lbpPrice: '100,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Mint%20Tea%20-%20Healthier%20Steps-K09FCIl8LarX2J4jW8Xjz2jdz4SGtN.jpg' },
      { name: 'Ginger and Honey', description: 'Warm ginger with soothing honey.', price: '$1.50', lbpPrice: '150,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%F0%9F%8D%B5%E2%9C%A8%20Boost%20your%20wellness%20with%20Turmeric%20Ginger%20Detox%E2%80%A6-ZuXGzKnSKAtkGGw6dF8zluNlgAMTZb.jpg' },
      { name: 'Chamomile', description: 'Relaxing chamomile flowers steeped to calm.', price: '$1.50', lbpPrice: '150,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5%20motivos%20para%20tomar%20ch%C3%A1%20de%20camomila-krP5Rh6ygGTtzKuGO8YcYO9HoI9VgX.jpg' },
      { name: 'Green Tea', description: 'Fresh green tea with natural antioxidants.', price: '$1.50', lbpPrice: '150,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Download%20Cup%20of%20tea%20with%20mint%20leaves%20on%20transparent%20background%20for%20free-dVWvZk3WigRlkFEKZQtfcDFOwMcIY0.jpg' },
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
      { name: 'Lazy Cake', description: 'No-bake indulgence with layers of flavor.', price: '$3.50', lbpPrice: '300,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-9UXhz9OicC31LRDeCJeHhsIJN8Yshu.png' },
      { name: 'Fondant', description: 'Warm chocolate center with delicious fondant.', price: '$5', lbpPrice: '450,000 LBP', image: null },
      { name: 'Chocolate Cake', description: 'Rich dark chocolate cake perfection.', price: '$5', lbpPrice: '450,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EL1k14PAkXovY7n1gx7fvPdYsbW1wh.png' },
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
      { name: 'Oreo Cheesecake', description: 'Creamy cheesecake with Oreo cookie crumble.', price: '$5', lbpPrice: '450,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Dt52eLBdTVXlatatfFekmMGWynWUW9.png' },
      { name: 'Raspberry Cheesecake', description: 'Smooth cheesecake with fresh raspberry sauce.', price: '$5', lbpPrice: '450,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Cyy23HENQZpQMA5YM49q4LrdWEJdWL.png' },
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
      { name: 'Vanilla Mushroom Muffin', description: 'Soft vanilla muffin with mushroom top.', price: '$4', lbpPrice: '350,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jyyr1osfvSd53tv63b4IO3hsjGWyu6.png' },
      { name: 'Chocolate Mushroom Muffin', description: 'Rich chocolate muffin with mushroom crown.', price: '$4', lbpPrice: '350,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-vrzWQm0vPdBhkdfAN3Cplhoyjr5c4p.png' },
      { name: 'Croissant', description: 'Flaky French-style croissant, baked fresh daily.', price: '$3', lbpPrice: '250,000 LBP', image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-lJJOUjm0bUeldmdyrsVfGboEJz3Igr.png' },
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
      { name: 'Tuna Cado', description: 'Fresh tuna with creamy avocado.', price: '$5', lbpPrice: '450,000 LBP', image: null },
      { name: 'Turkey and Cheese', description: 'Sliced turkey with melted cheese.', price: '$5', lbpPrice: '450,000 LBP', image: null },
      { name: 'Hallum Pesto', description: 'Grilled halloumi with fresh pesto.', price: '$6', lbpPrice: '550,000 LBP', image: null },
      { name: 'Chicken Cesar Salad', description: 'Grilled chicken with Caesar dressing.', price: '$6.50', lbpPrice: '600,000 LBP', image: null },
      { name: 'Nuts', description: 'Mixed nuts and seeds blend.', price: '$2.50', lbpPrice: '250,000 LBP', image: null },
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
      { name: 'Greek Yogurt', description: 'Smooth and creamy Greek yogurt.', price: '$3', lbpPrice: '300,000 LBP', image: null },
      { name: 'Mango Greek Yogurt', description: 'Greek yogurt with fresh mango flavor.', price: '$3', lbpPrice: '300,000 LBP', image: null },
      { name: 'Toppings', description: 'Granola, nuts, and fruit toppings.', price: '$1', lbpPrice: '100,000 LBP', image: null },
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
      { name: '1 Hour Court', description: 'Full hour of padel court play for up to 4 players', price: '$20', lbpPrice: '1,800,000 LBP', image: null },
      { name: '1.5 Hours Court', description: 'Extended session with 1.5 hours of court time', price: '$30', lbpPrice: '2,700,000 LBP', image: null },
      { name: '1 Hour Coaching', description: 'Professional padel coaching session for skill development', price: '$30', lbpPrice: '2,700,000 LBP', image: null },
      { name: 'Premium Grip', description: 'High-quality grip tape for enhanced racket control', price: '$5', lbpPrice: '450,000 LBP', image: null },
      { name: 'Professional Ball Set', description: 'Pack of 3 official padel balls', price: '$9.99', lbpPrice: '900,000 LBP', image: null },
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
