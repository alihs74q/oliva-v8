// ─────────────────────────────────────────────────────────────────────────────
//  DESSERTS — PRODUCT DATA
//  Edit ONLY this array to update products on the page.
//
//  • name         full product name (shown in hero headline and cards)
//  • shortName    short keyword for the giant background text (e.g. "CHOCO", not "Choco Cake")
//  • description  one-line tagline
//  • price        price string  e.g. "$3"
//  • image        null = shows placeholder; replace with "/your-image.png" or URL
//  • themeColor   hex theme color for this product's slide; used when image is null
//                 TIP: once you add a real PNG, extract its dominant color and put it here
// ─────────────────────────────────────────────────────────────────────────────

export interface Dessert {
  name: string
  shortName: string
  description: string
  price: string
  lbpPrice: string
  image: string | null
  themeColor: string
  flavors: string[]    // available flavor options shown in the Choose Flavor strip
}

export const desserts: Dessert[] = [
  {
    name: 'Lazy Cake',
    shortName: 'LAZY',
    description: 'No-bake indulgence with layers of flavor.',
    price: '$3.50',
    lbpPrice: '300,000 LBP',
    image: '/images/products/LazyCake.jpg',
    themeColor: '#5C3220',
    flavors: ['Classic', 'Extra Chocolate', 'With Nuts'],
  },
  {
    name: 'Fondant',
    shortName: 'FONDANT',
    description: 'Warm chocolate center with delicious fondant.',
    price: '$5',
    lbpPrice: '450,000 LBP',
    image: '/images/products/Fondant.jpg',
    themeColor: '#3B2414',
    flavors: ['Dark Chocolate', 'Milk Chocolate', 'White Chocolate'],
  },
  {
    name: 'Oreo Cheesecake',
    shortName: 'OREO',
    description: 'Creamy cheesecake with Oreo cookie crumble.',
    price: '$5',
    lbpPrice: '450,000 LBP',
    image: '/images/products/OreoCheesecake.jpg',
    themeColor: '#1C1C1C',
    flavors: ['Classic Oreo', 'Double Oreo', 'Oreo & Vanilla'],
  },
  {
    name: 'Raspberry Cheesecake',
    shortName: 'RASPBERRY',
    description: 'Smooth cheesecake with fresh raspberry sauce.',
    price: '$5',
    lbpPrice: '450,000 LBP',
    image: '/images/products/RaspberryCheesecake.jpg',
    themeColor: '#A81C4D',
    flavors: ['Fresh Raspberry', 'Raspberry & Vanilla', 'Triple Berry'],
  },
  {
    name: 'Chocolate Cake',
    shortName: 'CHOCO',
    description: 'Rich dark chocolate cake perfection.',
    price: '$5',
    lbpPrice: '450,000 LBP',
    image: '/images/products/ChocolateCake.jpg',
    themeColor: '#3D2817',
    flavors: ['Dark Chocolate', 'Milk Chocolate', 'With Ganache'],
  },
  {
    name: 'Vanilla Mushroom Muffin',
    shortName: 'VANILLA',
    description: 'Soft vanilla muffin with mushroom top.',
    price: '$4',
    lbpPrice: '350,000 LBP',
    image: '/images/products/VanillaMushroomMuffin.jpg',
    themeColor: '#C9B287',
    flavors: ['Pure Vanilla', 'Vanilla & Chocolate Chips', 'Vanilla & Berry'],
  },
  {
    name: 'Chocolate Mushroom Muffin',
    shortName: 'CHOCO',
    description: 'Rich chocolate muffin with mushroom crown.',
    price: '$4',
    lbpPrice: '350,000 LBP',
    image: '/images/products/ChocolateMushroomMuffin.jpg',
    themeColor: '#6B4423',
    flavors: ['Dark Chocolate', 'Chocolate & Hazelnut', 'Chocolate & Almond'],
  },
  {
    name: 'Croissant',
    shortName: 'CROISSANT',
    description: 'Flaky French-style croissant, baked fresh daily.',
    price: '$3',
    lbpPrice: '250,000 LBP',
    image: '/images/products/Croissant.jpg',
    themeColor: '#D4A373',
    flavors: ['Plain', 'Chocolate', 'Almond'],
  },
]
