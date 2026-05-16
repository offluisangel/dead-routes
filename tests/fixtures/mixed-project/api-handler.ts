// Files that use the services

import { formatPrice, fetchProductsFromDB } from './services';

export async function getProductList() {
  const products = await fetchProductsFromDB();
  return products.map(p => ({
    ...p,
    displayPrice: formatPrice(p.price)
  }));
}
