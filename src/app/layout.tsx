// src/app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link'; // Používej Link pro rychlejší navigaci v Next.js

export const metadata: Metadata = {
  title: 'Firemní Kanban',
  description: 'Správa otázek a úkolů',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body>
        <nav className="navbar navbar-expand navbar-dark bg-primary shadow-sm mb-4">
          <div className="container">
            <a className="navbar-brand fw-bold" href="/">📌 Otázkovník</a>

            <div className="navbar-nav me-auto">
              {/* Tlačítko pro nový požadavek přímo v liště */}
              <Link href="/?new=true" className="btn btn-success btn-sm fw-bold ms-3 px-3">
                <i className="bi bi-plus-lg"></i> Nový požadavek
              </Link>
            </div>

            <div className="navbar-nav ms-auto">
              <a className="nav-link d-flex align-items-center gap-2" href="/people">
                <i className="bi bi-people-fill"></i> Správa osob
              </a>
              <a className="nav-link d-flex align-items-center gap-2" href="/tags">
                <i className="bi bi-tag-fill"></i> Správa tagů
              </a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}