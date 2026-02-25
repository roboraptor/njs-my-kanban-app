import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request, { params }) {
  const { id } = await params;
  db.prepare('DELETE FROM tags WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { name, color } = await request.json();
  db.prepare('UPDATE tags SET name = ?, color = ? WHERE id = ?').run(name, color, id);
  return NextResponse.json({ success: true });
}