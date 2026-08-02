// ─────────────────────────────────────────────────────────────────────────────
//  COLD DRINKS — PAGE BACKGROUND
//  Replace this URL with your own background photo.
//  One photo is used for every drink; only the tint overlay changes per drink.
// ─────────────────────────────────────────────────────────────────────────────
export const backgroundImage =
  'https://images.pexels.com/photos/3551717/pexels-photo-3551717.jpeg?auto=compress&cs=tinysrgb&w=1920'

export interface ColdDrink {
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
//  COLD DRINKS — PRODUCT DATA
//  Edit ONLY this array to add, remove or update products.
// ─────────────────────────────────────────────────────────────────────────────
export const coldDrinks: ColdDrink[] = [
  {
    name: 'Iced Spanish Latte',
    shortName: 'SPANISH',
    description: 'Condensed milk sweetness over iced espresso.',
    price: '$3.50',
    lbpPrice: '400,000 LBP',
    image: null,
    themeColor: '#0d2240',
    flavors: ['Classic'],
  },
  {
    name: 'Iced Mocha Latte',
    shortName: 'MOCHA',
    description: 'Chocolate and espresso over ice.',
    price: '$3.50',
    lbpPrice: '400,000 LBP',
    image: null,
    themeColor: '#15102a',
    flavors: ['Dark Chocolate', 'Milk Chocolate'],
  },
  {
    name: 'Iced Latte (Vanilla, Hazelnut, Salted Caramel)',
    shortName: 'LATTE',
    description: 'Choose your favorite flavor over ice.',
    price: '$3.50',
    lbpPrice: '300,000 LBP',
    image: null,
    themeColor: '#0e1f35',
    flavors: ['Vanilla', 'Hazelnut', 'Salted Caramel'],
  },
  {
    name: 'Irish Cream Latte',
    shortName: 'IRISH',
    description: 'Irish cream flavor over iced espresso.',
    price: '$3.50',
    lbpPrice: '300,000 LBP',
    image: null,
    themeColor: '#1a1208',
    flavors: ['Classic'],
  },
  {
    name: 'Caramel Macchiato',
    shortName: 'MACCHIATO',
    description: 'Vanilla and caramel over iced espresso.',
    price: '$3.50',
    lbpPrice: '300,000 LBP',
    image: null,
    themeColor: '#2a1c08',
    flavors: ['Classic'],
  },
  {
    name: 'Iced Matcha Latte',
    shortName: 'MATCHA',
    description: 'Stone-ground matcha whisked with cold milk.',
    price: '$4',
    lbpPrice: '350,000 LBP',
    image: null,
    themeColor: '#09261a',
    flavors: ['Oat Milk', 'Almond Milk', 'Regular Milk'],
  },
]
