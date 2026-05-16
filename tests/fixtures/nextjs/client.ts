export async function getUsers() {
  const response = await fetch('/api/users');
  return response.json();
}

export async function createUser(data: any) {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json();
}