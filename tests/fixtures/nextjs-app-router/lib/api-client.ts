const API_BASE = '/api/users';

export async function getUsers() {
  const res = await fetch(API_BASE);
  return res.json();
}

export async function createUser(data: any) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteUser(id: number) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}