/** Auto-generates image manifest from data files and assets */

import { hotDrinks } from '../data/hotDrinks';
import { coldDrinks } from '../data/coldDrinks';
import { desserts } from '../data/desserts';
import {
  coldDrinksSubcategories,
  hotDrinksSubcategories,
  dessertsSubcategories,
  shishaSubcategories,
  sandwichesSubcategories,
  yogurtSubcategories,
  padelSubcategories,
} from '../data/subcategories';

export interface ImageAsset {
  url: string;
  priority: 'high' | 'medium' | 'low';
  category?: string;
  contentHash?: string;
}

export function generateImageManifest(): ImageAsset[] {
  const images: Map<string, ImageAsset> = new Map();

  // Homepage hero frames - high priority
  for (let i = 1; i <= 48; i++) {
    const frameNum = String(i).padStart(3, '0');
    const url = `/hero-frames/frame_${frameNum}.webp`;
    images.set(url, { url, priority: 'high', category: 'hero' });
  }

  // Homepage static images - high priority
  const homepageImages = [
    '/oliva-logo.png',
    '/floral-fusion.png',
  ];
  homepageImages.forEach(url => {
    images.set(url, { url, priority: 'high', category: 'homepage' });
  });

  // Product images from data - medium/low priority
  const collectProductImages = (data: any[], category: string) => {
    if (Array.isArray(data)) {
      data.forEach((item: any) => {
        if (item.image && typeof item.image === 'string' && !item.image.startsWith('http')) {
          images.set(item.image, {
            url: item.image,
            priority: 'medium',
            category,
          });
        }
        if (Array.isArray(item.images)) {
          item.images.forEach((img: string) => {
            if (typeof img === 'string' && !img.startsWith('http')) {
              images.set(img, {
                url: img,
                priority: 'medium',
                category,
              });
            }
          });
        }
        if (item.drinks && Array.isArray(item.drinks)) {
          item.drinks.forEach((drink: any) => {
            if (drink.image && typeof drink.image === 'string' && !drink.image.startsWith('http')) {
              images.set(drink.image, {
                url: drink.image,
                priority: 'medium',
                category,
              });
            }
          });
        }
      });
    }
  };

  // Collect from all data sources
  collectProductImages(hotDrinks || [], 'hot-drinks');
  collectProductImages(coldDrinks || [], 'cold-drinks');
  collectProductImages(desserts || [], 'desserts');
  
  // Collect from subcategories
  [
    coldDrinksSubcategories,
    hotDrinksSubcategories,
    dessertsSubcategories,
    shishaSubcategories,
    sandwichesSubcategories,
    yogurtSubcategories,
    padelSubcategories,
  ].forEach(subcat => {
    if (Array.isArray(subcat)) {
      subcat.forEach(cat => {
        if (cat.drinks && Array.isArray(cat.drinks)) {
          cat.drinks.forEach((drink: any) => {
            if (drink.image && typeof drink.image === 'string' && !drink.image.startsWith('http')) {
              images.set(drink.image, {
                url: drink.image,
                priority: 'medium',
                category: cat.id,
              });
            }
          });
        }
      });
    }
  });

  return Array.from(images.values()).sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function getHighPriorityImages(): ImageAsset[] {
  return generateImageManifest().filter(img => img.priority === 'high');
}

export function getLowPriorityImages(): ImageAsset[] {
  return generateImageManifest().filter(img => img.priority !== 'high');
}
