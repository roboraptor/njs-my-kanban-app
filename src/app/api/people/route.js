import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const people = db.prepare('SELECT * FROM people ORDER BY name ASC').all();
    return NextResponse.json(people);
  } catch (error) {
    return NextResponse.json({ error: 'Chyba při načítání osob' }, { status: 500 });
  }
}

export async function POST(request) {
  const { name } = await request.json();
  const id = uuidv4();
  db.prepare('INSERT INTO people (id, name, is_questioner, is_assignee) VALUES (?, ?, 0, 0)').run(id, name);
  return NextResponse.json({ success: true });
}