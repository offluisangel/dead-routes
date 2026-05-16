export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

export function calculateTax(amount: number): number {
  return amount * 0.19;
}

export function validateInput(input: string): boolean {
  return input.length > 0;
}