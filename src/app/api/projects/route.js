import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Inicializace tabulky při prvním spuštění (Lazy init)
try {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prefix TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      counter INTEGER DEFAULT 0
    )
  `).run();

  // Vložení výchozích dat, pokud je tabulka prázdná
  const count = db.prepare('SELECT count(*) as count FROM projects').get().count;
  if (count === 0) {
    const insert = db.prepare('INSERT INTO projects (prefix, name, counter) VALUES (?, ?, ?)');
    insert.run('TASK', 'Obecné úkoly', 0);
    insert.run('BUG', 'Chyby a Bugy', 0);
  }
} catch (e) {
  console.error("Chyba při inicializaci tabulky projects:", e);
}

export async function GET() {
  const projects = db.prepare('SELECT * FROM projects ORDER BY name ASC').all();
  return NextResponse.json(projects);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { prefix, name } = body;

    if (!prefix || !name) {
      return NextResponse.json({ error: 'Chybí prefix nebo název' }, { status: 400 });
    }

    const result = db.prepare('INSERT INTO projects (prefix, name, counter) VALUES (?, ?, 0)')
                     .run(prefix.toUpperCase(), name);
    
    return NextResponse.json({ id: result.lastInsertRowid, prefix: prefix.toUpperCase(), name, counter: 0 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Prefix pravděpodobně již existuje' }, { status: 400 });
  }
}
