// Price utility functions for Tripsera

export interface PriceRange {
  min: number;
  max: number;
}

export interface ItemWithPrice {
  price: number;
  price_range?: PriceRange;
}

/**
 * Format price range for display
 * @param item - Item with price and optional price_range
 * @returns Formatted price string
 */
export function formatPrice(item: ItemWithPrice | null | undefined): string {
  if (!item) return '₹0';
  if (item.price_range) {
    return `₹${item.price_range.min.toLocaleString()} - ₹${item.price_range.max.toLocaleString()}`;
  }
  return `₹${(item.price || 0).toLocaleString()}`;
}

/**
 * Get the average price from a price range
 * @param item - Item with price and optional price_range
 * @returns Average price number
 */
export function getAveragePrice(item: ItemWithPrice | null | undefined): number {
  if (!item) return 0;
  if (item.price_range) {
    return Math.round((item.price_range.min + item.price_range.max) / 2);
  }
  return item.price || 0;
}

/**
 * Get the minimum price from an item
 * @param item - Item with price and optional price_range
 * @returns Minimum price number
 */
export function getMinPrice(item: ItemWithPrice | null | undefined): number {
  if (!item) return 0;
  if (item.price_range) {
    return item.price_range.min;
  }
  return item.price || 0;
}

/**
 * Get the maximum price from an item
 * @param item - Item with price and optional price_range
 * @returns Maximum price number
 */
export function getMaxPrice(item: ItemWithPrice | null | undefined): number {
  if (!item) return 0;
  if (item.price_range) {
    return item.price_range.max;
  }
  return item.price || 0;
}

/**
 * Check if an item has a price range
 * @param item - Item with price and optional price_range
 * @returns Boolean indicating if item has price range
 */
export function hasPriceRange(item: ItemWithPrice | null | undefined): boolean {
  if (!item) return false;
  return !!(item.price_range && item.price_range.min !== item.price_range.max);
}

/**
 * Format price for calculation (uses average price for ranges)
 * @param item - Item with price and optional price_range
 * @returns Price number for calculations
 */
export function getPriceForCalculation(item: ItemWithPrice | null | undefined): number {
  return getAveragePrice(item);
}
