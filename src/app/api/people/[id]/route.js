import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Získáme hodnoty a zajistíme, aby to byla čísla 0 nebo 1
    const is_questioner = body.is_questioner ? 1 : 0;
    const is_assignee = body.is_assignee ? 1 : 0;

    const stmt = db.prepare('UPDATE people SET is_questioner = ?, is_assignee = ? WHERE id = ?');
    const result = stmt.run(is_questioner, is_assignee, id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Osoba nenalezena' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chyba při updatu osoby:", error);
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 });
  }
}

// Metoda pro smazání osoby
export async function DELETE(request, { params }) {
  try {
    const { id } = await params; // Nutný await v Next.js 15+
    
    const stmt = db.prepare('DELETE FROM people WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Osoba nenalezena' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chyba při DELETE /api/people/[id]:", error);
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 });
  }
}