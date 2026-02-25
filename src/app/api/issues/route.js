import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    // KLÍČOVÁ ZMĚNA: Používáme poddotaz pro získání tagů ve formátu "Jméno|Barva"
    const issues = db.prepare(`
      SELECT i.*, 
        (SELECT GROUP_CONCAT(t.name || '|' || t.color) 
         FROM tags t 
         JOIN issue_tags it ON t.id = it.tag_id 
         WHERE it.issue_id = i.id) as tag_list
      FROM issues i 
      ORDER BY i.created_at DESC
    `).all();
    
    return NextResponse.json(issues || []);
  } catch (error) {
    console.error("Chyba při načítání úkolů:", error);
    return NextResponse.json({ error: 'Chyba při načítání z databáze' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title');
    const author = formData.get('author');
    const assignee = formData.get('assignee');
    const description = formData.get('description');
    const ref_code = formData.get('ref_code');
    const file = formData.get('image');
    const tagsJson = formData.get('tags'); 
    
    // Parsujeme ID tagů (přicházejí jako JSON pole z modalu)
    const tagIds = tagsJson ? JSON.parse(tagsJson) : []; 

    const id = uuidv4();
    let imageBuffer = null;
    let imageType = null;

    if (file && file instanceof Blob && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
      imageType = file.type;
    }

    const hasImage = imageBuffer ? 1 : 0;

    const insertTransaction = db.transaction(() => {
      // 1. Zápis do hlavní tabulky
      db.prepare(`
        INSERT INTO issues (id, title, description, ref_code, author, assignee, has_image)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, description, ref_code, author, assignee, hasImage);

      // 2. Zápis vazeb na tagy (vazební tabulka M:N)
      if (tagIds.length > 0) {
        const insertTagLink = db.prepare('INSERT INTO issue_tags (issue_id, tag_id) VALUES (?, ?)');
        for (const tagId of tagIds) {
          insertTagLink.run(id, tagId);
        }
      }

      // 3. Zápis do tabulky s obrázky
      if (imageBuffer) {
        db.prepare(`
          INSERT INTO attachments (issue_id, image_data, image_type)
          VALUES (?, ?, ?)
        `).run(id, imageBuffer, imageType);
      }
    });

    insertTransaction();

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Chyba při ukládání:", error);
    return NextResponse.json({ error: 'Chyba databáze' }, { status: 500 });
  }
}