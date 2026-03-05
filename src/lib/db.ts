import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'kanban.db');
const db = new Database(dbPath);

// Tabulka General
db.exec(`
  CREATE TABLE IF NOT EXISTS general (
    id TEXT PRIMARY KEY,
    org_name TEXT,
    header_org_name TEXT,
    color TEXT DEFAULT '#0074da',
    website TEXT,
    logo_url TEXT,
    email TEXT,
    phone TEXT,
    description TEXT,       
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Tabulka pro metadata (rychlá)
db.exec(`
  CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    issue_id TEXT,
    title TEXT NOT NULL,
    description TEXT,       
    ref_code TEXT,          
    author TEXT,
    assignee TEXT,
    status TEXT DEFAULT 'backlog',
    has_image INTEGER DEFAULT 0,
    is_archived INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prefix TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      counter INTEGER DEFAULT 0
    )
`);


// Tabulka pro binární data (těžká)
db.exec(`
  CREATE TABLE IF NOT EXISTS attachments (
    issue_id TEXT PRIMARY KEY,
    image_data BLOB,
    image_type TEXT,
    FOREIGN KEY(issue_id) REFERENCES issues(id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS people (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_questioner INTEGER DEFAULT 0,
    is_assignee INTEGER DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#59a8ec'
  );

  CREATE TABLE IF NOT EXISTS issue_tags (
    issue_id TEXT,
    tag_id INTEGER,
    PRIMARY KEY (issue_id, tag_id),
    FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
  );
`);

export default db;