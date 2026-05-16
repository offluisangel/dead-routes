export function formatDate(date: Date): string {
  return date.toISOString();
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function calculateDiscount(price: number): number {
  return price * 0.9;
}

export function validateEmail(email: string): boolean {
  return email.includes('@');
}