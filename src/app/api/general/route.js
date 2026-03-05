import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const general = db.prepare('SELECT * FROM general LIMIT 1').get();
    return NextResponse.json(general || {});
  } catch (error) {
    console.error("Chyba při načítání nastavení:", error);
    return NextResponse.json({ error: 'Chyba databáze' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { org_name, header_org_name, color, website, logo_url, email, phone, description } = body;

    // Zkusíme najít existující záznam
    const existing = db.prepare('SELECT id FROM general LIMIT 1').get();

    if (existing) {
      db.prepare(`
        UPDATE general
        SET org_name = ?, header_org_name = ?, color = ?, website = ?, logo_url = ?, email = ?, phone = ?, description = ?
        WHERE id = ?
      `).run(org_name, header_org_name, color, website, logo_url, email, phone, description, existing.id);
    } else {
      const id = uuidv4();
      db.prepare(`
        INSERT INTO general (id, org_name, header_org_name, color, website, logo_url, email, phone, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, org_name, header_org_name, color, website, logo_url, email, phone, description);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chyba při ukládání nastavení:", error);
    return NextResponse.json({ error: 'Chyba databáze' }, { status: 500 });
  }
}