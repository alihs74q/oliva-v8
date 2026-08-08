export type MenuExtraName = 'Cream' | 'Ice Cream' | 'Flavor' | 'Extra Shot';

export interface MenuExtra {
  name: MenuExtraName;
  calories: number;
  priceLbp: number;
  description: string;
}

export const MENU_EXTRAS: MenuExtra[] = [
  { name: 'Cream', calories: 25, priceLbp: 50_000, description: 'Whipped cream' },
  { name: 'Ice Cream', calories: 140, priceLbp: 50_000, description: '1 regular scoop' },
  { name: 'Flavor', calories: 50, priceLbp: 50_000, description: 'Regular syrup' },
  { name: 'Extra Shot', calories: 5, priceLbp: 100_000, description: '1 espresso shot' },
];

export const MENU_EXTRA_NAMES = MENU_EXTRAS.map((extra) => extra.name);

export function getMenuExtra(name: string): MenuExtra | undefined {
  return MENU_EXTRAS.find((extra) => extra.name === name);
}

/**
 * The initial availability matrix requested for the menu. Admin edits are
 * stored on each CMS product and override these defaults once published.
 */
export function getDefaultProductExtras(productName: string, subcategoryId: string): MenuExtraName[] {
  const name = productName.trim().toLowerCase();

  if (subcategoryId === 'milk-shake' || subcategoryId === 'milk-shakes' || subcategoryId === 'smoothies') {
    return subcategoryId === 'milk-shake' || subcategoryId === 'milk-shakes'
      ? ['Cream', 'Ice Cream', 'Flavor']
      : ['Cream', 'Flavor'];
  }
  if (subcategoryId === 'refreshers') return ['Flavor'];
  if (subcategoryId === 'coffee-frappe') return ['Cream', 'Ice Cream', 'Extra Shot', 'Flavor'];
  if (subcategoryId === 'iced-latte') return ['Cream', 'Extra Shot', 'Flavor'];
  if (['cakes', 'cheesecakes', 'pastries'].includes(subcategoryId)) return ['Cream', 'Ice Cream'];

  if (subcategoryId === 'classic-hot') {
    if (name === 'ginger & honey' || name === 'ginger and honey') return [];
    if (name === 'cappuccino') return ['Extra Shot', 'Flavor'];
    if (name === 'tea' || name === 'chamomile' || name === 'green tea') return ['Flavor'];
    if (name === 'espresso') return ['Cream', 'Ice Cream', 'Extra Shot', 'Flavor'];
    return ['Cream', 'Extra Shot', 'Flavor'];
  }

  // These are available in the cold-beverages list when that category is
  // enabled in CMS.
  if (subcategoryId === 'cold-beverages') {
    if (name === 'water 0.5 l') return [];
    return ['Flavor'];
  }

  return [];
}

export function formatLbp(amount: number): string {
  return `${amount.toLocaleString('en-US')} LBP`;
}

export function formatUsdFromLbp(amount: number, ratePerUsd = 89_500): string {
  if (!amount) return '$0';
  const rounded = Math.round((amount / ratePerUsd) * 2) / 2;
  return rounded === Math.floor(rounded) ? `$${rounded}` : `$${rounded.toFixed(2)}`;
}