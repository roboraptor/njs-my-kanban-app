import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. SCÉNÁŘ: Kompletní editace z modalu
    if (body.fullUpdate) {
      const { title, description, ref_code, author, assignee, tagIds } = body;

      const transaction = db.transaction(() => {
        // Update základních údajů v tabulce issues
        db.prepare(`
          UPDATE issues 
          SET title = ?, description = ?, ref_code = ?, author = ?, assignee = ? 
          WHERE id = ?
        `).run(title, description, ref_code, author, assignee, id);

        // Update tagů: Nejdříve smažeme staré vazby pro tento úkol
        db.prepare('DELETE FROM issue_tags WHERE issue_id = ?').run(id);

        // Poté vložíme nové vazby (pokud jsou nějaké vybrány)
        if (tagIds && tagIds.length > 0) {
          const insertTagLink = db.prepare('INSERT INTO issue_tags (issue_id, tag_id) VALUES (?, ?)');
          for (const tagId of tagIds) {
            insertTagLink.run(id, tagId);
          }
        }
      });

      transaction();
      return NextResponse.json({ success: true, message: 'Úkol byl kompletně aktualizován' });
    } 
    
    // 2. SCÉNÁŘ: Rychlá změna stavu (Drag & Drop)
    else {
      const { status } = body;
      const allowedStatuses = ['backlog', 'waiting', 'done'];
      
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: 'Neplatný stav' }, { status: 400 });
      }

      const result = db.prepare('UPDATE issues SET status = ? WHERE id = ?').run(status, id);

      if (result.changes === 0) {
        return NextResponse.json({ error: 'Úkol nenalezen' }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: 'Status aktualizován' });
    }

  } catch (error) {
    console.error("Chyba při PATCH /api/issues/[id]:", error);
    return NextResponse.json({ error: 'Chyba databáze' }, { status: 500 });
  }
}

// Přidáme rovnou i DELETE, ať můžeš úkoly v detailu i mazat
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    // Díky ON DELETE CASCADE v databázi se automaticky smažou i tagy a obrázek
    const result = db.prepare('DELETE FROM issues WHERE id = ?').run(id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Úkol nenalezen' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chyba při DELETE /api/issues/[id]:", error);
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 });
  }
}