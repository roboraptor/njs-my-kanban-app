import { NextResponse } from 'next/server';
import db from '@/lib/db';

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
