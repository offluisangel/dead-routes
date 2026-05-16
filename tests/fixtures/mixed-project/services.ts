// Service layer with both used and unused functions

export interface Product {
  id: number;
  name: string;
  price: number;
}

// USED - called in components
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

// USED - called in API handler
export async function fetchProductsFromDB(): Promise<Product[]> {
  // Simulated DB call
  return [{ id: 1, name: 'Product 1', price: 99.99 }];
}

// UNUSED - never called anywhere
export function calculateDiscount(price: number, percent: number): number {
  return price * (1 - percent / 100);
}

// UNUSED - never called
export function validateProductName(name: string): boolean {
  return name.length > 0 && name.length < 100;
}
