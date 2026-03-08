import db from '../src/lib/db';
import crypto from 'crypto';

const seed = () => {
  console.log('🌱 Seeding database...');

  // Vymazání existujících dat (pro čistý start)
  // Pořadí je důležité kvůli cizím klíčům (Foreign Keys)
  db.prepare('DELETE FROM issue_tags').run();
  db.prepare('DELETE FROM attachments').run();
  db.prepare('DELETE FROM projects').run();
  db.prepare('DELETE FROM general').run();
  db.prepare('DELETE FROM issues').run();
  db.prepare('DELETE FROM people').run();
  db.prepare('DELETE FROM tags').run();

  console.log('🧹 Cleared existing data.');

  // 1. Vložení lidí
  const people = [
    { id: '8eca4476-119a-4a56-b665-21bdbcc96399', name: 'Jan Novák', is_questioner: 1, is_assignee: 0 },
    { id: 'ce7ca7d5-802b-400a-bce5-c7ca33fcad5d', name: 'Petr Svoboda', is_questioner: 0, is_assignee: 1 },
    { id: 'd58f9b17-6984-4de7-a1b0-d42f190cd7ce', name: 'Marie Dvořáková', is_questioner: 1, is_assignee: 1 },
  ];

  const insertPerson = db.prepare(`
    INSERT INTO people (id, name, is_questioner, is_assignee) VALUES (@id, @name, @is_questioner, @is_assignee)
  `);

  people.forEach(person => insertPerson.run(person));
  console.log(`✅ Inserted ${people.length} people`);

  // 1.5. Vložení projektů
  const projects = [
    { prefix: 'KAN', name: 'Kanban App', counter: 1 },
    { prefix: 'WEB', name: 'Company Website', counter: 2 },
  ];

  const insertProject = db.prepare(`
    INSERT INTO projects (prefix, name, counter) VALUES (@prefix, @name, @counter)
  `);

  projects.forEach(project => insertProject.run(project));
  console.log(`✅ Inserted ${projects.length} projects`);

  // 2. Vložení tagů
  const tags = [
    { name: 'Tech', color: '#dc3545' },     // Červená
    { name: 'Feature', color: '#28a745' }, // Zelená
    { name: 'Interesting', color: '#ffc107' },  // Žlutá
  ];

  const insertTag = db.prepare(`
    INSERT INTO tags (name, color) VALUES (@name, @color)
  `);

  // Uložíme si ID vložených tagů, abychom je mohli použít níže
  const tagIds = tags.map(tag => insertTag.run(tag).lastInsertRowid);
  console.log(`✅ Inserted ${tags.length} tags`);

  // 3. Vložení úkolů (issues)
  const issues = [
    {
      id: 'dcb2035c-c328-48eb-af08-468c137c5597',
      title: 'Nefunguje přihlášení',
      description: 'Při pokusu o přihlášení vyskočí chyba 500.',
      issue_id: 'KAN-001',
      author: people[0].name, // Jan Novák
      assignee: people[1].name, // Petr Svoboda
      status: 'waiting',
      has_image: 0,
      is_archived: 0
    },
    {
      id: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8',
      title: 'Přidat tmavý režim',
      description: 'Uživatelé chtějí dark mode pro lepší práci v noci.',
      issue_id: 'WEB-002',
      author: people[1].name, 
      assignee: people[2].name,
      status: 'backlog',
      has_image: 0,
      is_archived: 0
    },
        {
      id: 'f4e5d6c7-b8a9-0123-4567-890123456789',
      title: 'Přidat světlý režim',
      description: 'Uživatelé chtějí light mode pro lepší práci přes den.',
      issue_id: 'WEB-001',
      author: people[0].name, 
      assignee: people[2].name,
      status: 'done',
      has_image: 0,
      is_archived: 1
    }
  ];

  const insertIssue = db.prepare(`
    INSERT INTO issues (id, title, description, issue_id, author, assignee, status, has_image, is_archived)
    VALUES (@id, @title, @description, @issue_id, @author, @assignee, @status, @has_image, @is_archived)
  `);



  issues.forEach(issue => insertIssue.run(issue));
  console.log(`✅ Inserted ${issues.length} issues`);

  // 4. Propojení tagů s úkoly
  const insertIssueTag = db.prepare(`
    INSERT INTO issue_tags (issue_id, tag_id) VALUES (@issue_id, @tag_id)
  `);

  // Používáme UUID úkolu (issues[x].id) a ID tagu z databáze (tagIds[x])
  insertIssueTag.run({ issue_id: issues[0].id, tag_id: tagIds[0] }); // KAN-001 -> Tech
  insertIssueTag.run({ issue_id: issues[0].id, tag_id: tagIds[2] }); // KAN-001 -> Interesting
  insertIssueTag.run({ issue_id: issues[1].id, tag_id: tagIds[1] }); // WEB-002 -> Feature

  console.log(`✅ Linked tags to issues`);

  // 5. Vložení informací o organizaci (General)
  const generalData = {
    org_name: 'Moje Firma s.r.o.',
    header_org_name: 'Moje Firma',
    color: '#0074da',
    website: 'https://example.com',
    logo_url: 'https://placehold.co/150x50',
    email: 'info@example.com',
    phone: '+420 123 456 789',
    description: 'Jsme inovativní společnost zaměřená na efektivní řízení projektů.',
  };

  const insertGeneral = db.prepare(`
    INSERT INTO general (org_name, header_org_name, color, website, logo_url, email, phone, description)
    VALUES (@org_name, @header_org_name, @color, @website, @logo_url, @email, @phone, @description)
  `);

  insertGeneral.run(generalData);
  console.log(`✅ Inserted general organization info`);

  console.log('🚀 Database seeded successfully!');
};

seed();