import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

const configPath = path.resolve(process.cwd(), 'kanban-config.json');
const defaultDbPath = path.resolve(process.cwd(), 'kanban.db');

export async function GET() {
  let currentPath = defaultDbPath;
  try {
    if (fs.existsSync(configPath)) {
      const fileContent = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(fileContent);
      if (config.dbPath) {
        currentPath = config.dbPath;
      }
    }
  } catch (e) {
    console.error("Chyba při čtení konfigurace:", e);
  }
  return NextResponse.json({ dbPath: currentPath });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { dbPath } = body;

    if (!dbPath) {
      return NextResponse.json({ error: 'Cesta k databázi je povinná' }, { status: 400 });
    }

    const config = { dbPath };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return NextResponse.json({ success: true, dbPath });
  } catch (error) {
    console.error("Chyba při ukládání konfigurace:", error);
    return NextResponse.json({ error: 'Chyba při ukládání' }, { status: 500 });
  }
}