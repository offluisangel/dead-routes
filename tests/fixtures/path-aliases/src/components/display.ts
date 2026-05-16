import { formatPrice, calculateTax } from '@/lib';
import { validateInput } from '@/lib/utils';

export function showPrice(amount: number) {
  return formatPrice(amount);
}

export function getTax(amount: number) {
  return calculateTax(amount);
}

export function checkInput(text: string) {
  return validateInput(text);
}