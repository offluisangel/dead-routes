import { formatCurrency, validateEmail } from '../lib/utils';

export function displayPrice(amount: number) {
  return formatCurrency(amount);
}

export function checkEmail(email: string) {
  return validateEmail(email);
}