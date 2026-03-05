// src/app/api/links/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Inicializace tabulky pro vazby
try {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS issue_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_issue_id TEXT NOT NULL,
      target_issue_id TEXT NOT NULL,
      type TEXT NOT NULL, -- 'blocks', 'relates_to', 'parent_of'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(source_issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY(target_issue_id) REFERENCES issues(id) ON DELETE CASCADE
    )
  `).run();
} catch (e) {
  console.error("Chyba při inicializaci tabulky issue_links:", e);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const issueId = searchParams.get('issue_id');

  if (!issueId) return NextResponse.json([]);

  // Načteme vazby, kde je úkol buď zdrojem, nebo cílem
  // Připojíme informace o "tom druhém" úkolu
  const links = db.prepare(`
    SELECT l.*, 
      i_source.title as source_title, i_source.issue_id as source_readable_id, i_source.status as source_status,
      i_target.title as target_title, i_target.issue_id as target_readable_id, i_target.status as target_status
    FROM issue_links l
    LEFT JOIN issues i_source ON l.source_issue_id = i_source.id
    LEFT JOIN issues i_target ON l.target_issue_id = i_target.id
    WHERE l.source_issue_id = ? OR l.target_issue_id = ?
  `).all(issueId, issueId);

  return NextResponse.json(links);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { source_issue_id, target_issue_id, type } = body;

    if (!source_issue_id || !target_issue_id || !type) {
      return NextResponse.json({ error: 'Chybí data' }, { status: 400 });
    }

    // Zabráníme duplicitám a cyklení (zjednodušeně)
    if (source_issue_id === target_issue_id) {
      return NextResponse.json({ error: 'Nelze propojit úkol sám se sebou' }, { status: 400 });
    }

    const stmt = db.prepare('INSERT INTO issue_links (source_issue_id, target_issue_id, type) VALUES (?, ?, ?)');
    const info = stmt.run(source_issue_id, target_issue_id, type);
    
    return NextResponse.json({ id: info.lastInsertRowid });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Chyba databáze' }, { status: 500 });
  }
}
