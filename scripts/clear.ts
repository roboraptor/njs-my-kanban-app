import db from '../src/lib/db';
import crypto from 'crypto';

const clear = () => {
  console.log('🌱 Seeding database...');

  db.prepare('DELETE FROM issue_tags').run();
  db.prepare('DELETE FROM attachments').run();
  db.prepare('DELETE FROM projects').run();
  db.prepare('DELETE FROM general').run();
  db.prepare('DELETE FROM issues').run();
  db.prepare('DELETE FROM people').run();
  db.prepare('DELETE FROM tags').run();

  console.log('🧹 Cleared existing data.');

};

clear();