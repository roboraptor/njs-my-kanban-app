import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Načtení všech tagů
export async function GET() {
  try {
    const tags = db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
    return NextResponse.json(tags || []);
  } catch (error) {
    console.error("Chyba při GET /api/tags:", error);
    return NextResponse.json({ error: 'Chyba databáze' }, { status: 500 });
  }
}

// Vytvoření nového tagu
export async function POST(request) {
  try {
    const { name, color } = await request.json();
    const id = uuidv4();

    db.prepare('INSERT INTO tags (name, color) VALUES ( ?, ?)')
      .run(name, color || '#6c757d');

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Chyba při POST /api/tags:", error);
    return NextResponse.json({ error: 'Chyba databáze' }, { status: 500 });
  }
}