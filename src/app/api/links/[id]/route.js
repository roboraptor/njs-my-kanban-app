// src/app/api/links/[id]/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    db.prepare('DELETE FROM issue_links WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Chyba při mazání' }, { status: 500 });
  }
}
