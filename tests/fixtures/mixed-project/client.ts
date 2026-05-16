// Client-side code making HTTP calls

export async function fetchProducts() {
  const response = await fetch('/api/products');
  return response.json();
}

export async function createProduct(name: string, price: number) {
  const response = await fetch('/api/products', {
    method: 'POST',
    body: JSON.stringify({ name, price }),
  });
  return response.json();
}

// NOTE: deleteProduct() and getItems() functions are NOT called anywhere
// So the DELETE /api/legacy/items/:id and GET /api/legacy/items routes should be dead
