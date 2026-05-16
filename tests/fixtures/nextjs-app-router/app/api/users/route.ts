import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ users: [] });
}

export async function POST(request: Request) {
  const data = await request.json();
  return NextResponse.json({ id: 1, ...data });
}

export async function DELETE(request: Request) {
  return NextResponse.json({ deleted: true });
}