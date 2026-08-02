// ─────────────────────────────────────────────────────────────────────────────
//  HOT DRINKS — PAGE BACKGROUND
//  Replace this URL with your own café background photo.
//  One photo is used for every drink; only the tint overlay changes per drink.
// ─────────────────────────────────────────────────────────────────────────────
export const backgroundImage =
  'https://images.pexels.com/photos/683039/pexels-photo-683039.jpeg?auto=compress&cs=tinysrgb&w=1920'

export interface HotDrink {
  name: string
  shortName: string    // short word for the giant background text inside the panel
  description: string
  price: string
  lbpPrice: string
  image: string | null // null = placeholder; replace with "/your-image.png" or a URL
  themeColor: string   // hex — used as the blended tint over the background photo
  flavors: string[]    // available flavor options shown in the Choose Flavor strip
}

// ─────────────────────────────────────────────────────────────────────────────
//  HOT DRINKS — PRODUCT DATA
//  Edit ONLY this array to add, remove or update products.
// ─────────────────────────────────────────────────────────────────────────────
export const hotDrinks: HotDrink[] = [
  {
    name: 'Café Latte (Vanilla, Hazelnut)',
    shortName: 'LATTE',
    description: 'Smooth espresso with silky steamed milk.',
    price: '$3',
    lbpPrice: '300,000 LBP',
    image: null,
    themeColor: '#7a4820',
    flavors: ['Vanilla', 'Hazelnut'],
  },
  {
    name: 'Hot Chocolate',
    shortName: 'CHOCOLATE',
    description: 'Rich dark cocoa with steamed milk and a touch of cream.',
    price: '$3',
    lbpPrice: '300,000 LBP',
    image: null,
    themeColor: '#3b1208',
    flavors: ['Dark', 'Milk', 'White'],
  },
  {
    name: 'Cappuccino',
    shortName: 'CAPPUCCINO',
    description: 'Velvety microfoam over a double espresso shot.',
    price: '$3',
    lbpPrice: '300,000 LBP',
    image: null,
    themeColor: '#6b3010',
    flavors: ['Classic', 'Wet', 'Dry'],
  },
  {
    name: 'Espresso',
    shortName: 'ESPRESSO',
    description: 'Rich single-origin shot, bold and intensely aromatic.',
    price: '$1.50',
    lbpPrice: '100,000 LBP',
    image: null,
    themeColor: '#2a1000',
    flavors: ['Single Shot', 'Double Shot', 'Ristretto'],
  },
  {
    name: 'Tea',
    shortName: 'TEA',
    description: 'Fresh garden tea leaves steeped to perfection.',
    price: '$1.50',
    lbpPrice: '100,000 LBP',
    image: null,
    themeColor: '#0e3018',
    flavors: ['Black', 'Green', 'Mint'],
  },
  {
    name: 'Ginger and Honey',
    shortName: 'GINGER',
    description: 'Warm ginger with soothing honey.',
    price: '$1.50',
    lbpPrice: '150,000 LBP',
    image: null,
    themeColor: '#8B4513',
    flavors: ['Fresh Ginger', 'Ginger & Lemon', 'Honey Ginger'],
  },
  {
    name: 'Chamomile',
    shortName: 'CHAMOMILE',
    description: 'Relaxing chamomile flowers steeped to calm.',
    price: '$1.50',
    lbpPrice: '150,000 LBP',
    image: null,
    themeColor: '#DAA520',
    flavors: ['Pure Chamomile', 'Chamomile & Honey', 'Chamomile & Mint'],
  },
  {
    name: 'Green Tea',
    shortName: 'GREEN',
    description: 'Fresh green tea with natural antioxidants.',
    price: '$1.50',
    lbpPrice: '150,000 LBP',
    image: null,
    themeColor: '#2D5016',
    flavors: ['Pure Green', 'Green & Jasmine', 'Green & Honey'],
  },
]
