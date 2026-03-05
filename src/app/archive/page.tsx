// src/app/archive/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Issue } from '@/app/page'; // Importujeme typ z hlavní stránky
import IssueDetailModal from '@/components/IssueDetailModal';

export default function ArchivePage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  
  const loadArchivedIssues = () => {
    setLoading(true);
    fetch('/api/issues?archived=true')
      .then(res => res.json())
      .then(data => {
        setIssues(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadArchivedIssues();
  }, []);

  const restoreIssue = async (id: string) => {
    if (!confirm('Obnovit tento úkol zpět na nástěnku?')) return;
    
    await fetch(`/api/issues/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_archived: 0 })
    });
    
    loadArchivedIssues(); // Obnovíme seznam (úkol zmizí z archivu)
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold">🗄️ Archiv úkolů</h1>
        <Link href="/" className="btn btn-outline-primary">
          <i className="bi bi-arrow-left"></i> Zpět na nástěnku
        </Link>
      </div>

      {selectedIssue && (
        <IssueDetailModal 
          issue={selectedIssue} 
          onClose={() => setSelectedIssue(null)} 
          onSaved={loadArchivedIssues} 
        />
      )}

      {loading ? (
        <div className="text-center py-5 text-muted">Načítám archiv...</div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Název a Popis</th>
                  <th>Autor</th>
                  <th>Řešitel</th>
                  <th>Vytvořeno</th>
                  <th className="text-end">Akce</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Archiv je prázdný.
                    </td>
                  </tr>
                ) : (
                  issues.map(issue => (
                    <tr key={issue.id}>
                      <td className="fw-bold text-nowrap">
                        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
                          {issue.issue_id}
                        </span>
                      </td>
                      <td>
                        <div className="fw-bold">{issue.title}</div>
                        <div className="small text-muted text-truncate" style={{maxWidth: '400px'}}>
                          {issue.description}
                        </div>
                      </td>
                      <td>{issue.author}</td>
                      <td>{issue.assignee}</td>
                      <td className="small text-muted">
                        {new Date(issue.created_at).toLocaleDateString('cs-CZ')}
                      </td>
                      <td className="text-end">
                        <button 
                          className="btn btn-sm btn-outline-secondary me-2" 
                          onClick={() => setSelectedIssue(issue)}
                          title="Zobrazit detail"
                        >
                          <i className="bi bi-eye"></i> Detail
                        </button>
                        <button 
                          className="btn btn-sm btn-success" 
                          onClick={() => restoreIssue(issue.id)}
                          title="Obnovit na nástěnku"
                        >
                          <i className="bi bi-arrow-counterclockwise"></i> Obnovit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
