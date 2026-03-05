import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Migrace: Přidání sloupce issue_id, pokud neexistuje
try {
  db.prepare("ALTER TABLE issues ADD COLUMN issue_id TEXT").run();
} catch (e) {
  // Sloupec pravděpodobně již existuje
}

// Migrace: Přidání sloupce is_archived, pokud neexistuje
try {
  db.prepare("ALTER TABLE issues ADD COLUMN is_archived INTEGER DEFAULT 0").run();
} catch (e) {}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const showArchived = searchParams.get('archived') === 'true' ? 1 : 0;

    // KLÍČOVÁ ZMĚNA: Používáme poddotaz pro získání tagů ve formátu "Jméno|Barva"
    const issues = db.prepare(`
      SELECT i.*, 
        (SELECT GROUP_CONCAT(t.name || '|' || t.color) 
         FROM tags t 
         JOIN issue_tags it ON t.id = it.tag_id 
         WHERE it.issue_id = i.id) as tag_list,
        (SELECT GROUP_CONCAT(tag_id) 
         FROM issue_tags 
         WHERE issue_id = i.id) as tag_ids
      FROM issues i 
      WHERE i.is_archived = ?
      ORDER BY i.created_at DESC
    `).all(showArchived);
    
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
    const ref_code = formData.get('ref_code'); // Nyní načítáme ref_code z formuláře
    const project_prefix = formData.get('project_prefix');
    const file = formData.get('image');
    const tagsJson = formData.get('tags'); 
    
    // Parsujeme ID tagů (přicházejí jako JSON pole z modalu)
    const tagIds = tagsJson ? JSON.parse(tagsJson) : []; 

    if (!title || !project_prefix) {
      return NextResponse.json({ error: 'Chybí povinné údaje (název nebo projekt)' }, { status: 400 });
    }

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
      // 1. Získat a zvýšit počítadlo pro daný projekt
      const project = db.prepare('SELECT counter FROM projects WHERE prefix = ?').get(project_prefix);
      
      if (!project) {
        throw new Error(`Projekt s prefixem ${project_prefix} neexistuje`);
      }

      const newCounter = project.counter + 1;
      db.prepare('UPDATE projects SET counter = ? WHERE prefix = ?').run(newCounter, project_prefix);

      // 2. Vygenerovat Issue ID (např. DEV-1)
      const issue_id = `${project_prefix}-${newCounter}`;

      db.prepare(`
        INSERT INTO issues (id, title, description, issue_id, ref_code, author, assignee, has_image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, description, issue_id, ref_code, author, assignee, hasImage);

      // 3. Zápis vazeb na tagy (vazební tabulka M:N)
      if (tagIds.length > 0) {
        const insertTagLink = db.prepare('INSERT INTO issue_tags (issue_id, tag_id) VALUES (?, ?)');
        for (const tagId of tagIds) {
          insertTagLink.run(id, tagId);
        }
      }

      // 4. Zápis do tabulky s obrázky
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