// Export that IS used elsewhere
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

// UNUSED export
export function calculateTax(amount: number): number {
  return amount * 0.1;
}

// UNUSED export
export function validateEmail(email: string): boolean {
  return email.includes('@');
}
