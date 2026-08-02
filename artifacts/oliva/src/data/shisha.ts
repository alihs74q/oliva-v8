// ─────────────────────────────────────────────────────────────────────────────
//  SHISHA / 2ARAGILE — PAGE BACKGROUND
//  Replace this URL with your own shisha photo.
// ─────────────────────────────────────────────────────────────────────────────
export const backgroundImage =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-awRUXZgCUaSRd5LnoYKBVKhnE9Z36Z.png'

export interface ShishaItem {
  id: string
  name: string
  shortName: string
  description: string
  price: string
  lbpPrice: string
  priceColor: string
  image: string | null
  themeColor: string
  flavors: string[]    // available flavor options shown in the Choose Flavor strip
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHISHA — PRODUCT DATA
//  Edit ONLY this array to add, remove or update products.
// ─────────────────────────────────────────────────────────────────────────────
export const shishaItems: ShishaItem[] = [
  {
    id: 'lemon-mint',
    name: 'Lemon Mint',
    shortName: 'MINT',
    description: 'Crisp lemon with cooling mint leaves.',
    price: '$5.50',
    lbpPrice: '500,000 LBP',
    priceColor: '#A4C639',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-klpHNUnY3MwHeGKY7cAgyUCnpsvMwk.png',
    themeColor: '#657B52',
    flavors: ['Fresh Lemon', 'Frozen Mint', 'Lemon & Honey'],
  },
  {
    id: 'double-apple',
    name: 'Double Apple',
    shortName: 'APPLE',
    description: 'Classic dual apple flavor, sweet and smooth.',
    price: '$5.50',
    lbpPrice: '500,000 LBP',
    priceColor: '#C62828',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-bg1AzOAvlolWak7jtcGIl6Qo9Cw0yt.png',
    themeColor: '#2a0e0e',
    flavors: ['Double Apple', 'Green Apple', 'Red Apple'],
  },
  {
    id: 'grape',
    name: 'Grape',
    shortName: 'GRAPE',
    description: 'Rich and sweet grape flavor.',
    price: '$5.50',
    lbpPrice: '500,000 LBP',
    priceColor: '#6F42C1',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OYNiRMMx8o2JWCECpBiReXveE9b4YZ.png',
    themeColor: '#3a1a4a',
    flavors: ['Purple Grape', 'Red Grape', 'Grape & Mint'],
  },
  {
    id: 'tanbak',
    name: 'Tanbak',
    shortName: 'TANBAK',
    description: 'Strong traditional tobacco flavor.',
    price: '$7.50',
    lbpPrice: '700,000 LBP',
    priceColor: '#8D6E63',
    image: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-jyDHjO5Wx9Z8uD1yNioltR69Ne0J5w.png',
    themeColor: '#1a1008',
    flavors: ['Tanbak', 'Tamar', 'Tinbak'],
  },
]
