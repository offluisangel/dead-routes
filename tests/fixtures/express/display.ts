// File that imports from utils
import { formatCurrency } from './utils';

export function displayPrice(price: number) {
  return formatCurrency(price);
}
