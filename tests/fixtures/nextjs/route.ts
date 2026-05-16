export async function GET(request: Request) {
  return Response.json({ users: [] });
}

export async function POST(request: Request) {
  const data = await request.json();
  return Response.json({ id: 1, ...data });
}

// DEAD ENDPOINT - never called
export async function DELETE(request: Request) {
  return Response.json({ deleted: true });
}
