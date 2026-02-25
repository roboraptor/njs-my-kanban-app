'use client';
import React, { useState, useEffect } from 'react';

interface Tag {
  id: string;
  name: string;
  color: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#0d6efd');

  const loadTags = () => {
    fetch('/api/tags').then(res => res.json()).then(setTags);
  };

  useEffect(() => { loadTags(); }, []);

  const addTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    
    await fetch('/api/tags', {
      method: 'POST',
      body: JSON.stringify({ name: newName, color: newColor }),
      headers: { 'Content-Type': 'application/json' }
    });
    setNewName('');
    loadTags();
  };

  return (
    <div className="container">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white py-3 d-flex justify-content-between">
          <h4 className="mb-0"><i className="bi bi-tag-fill"></i> Správa Tagů</h4>
          <a href="/" className="btn btn-outline-secondary btn-sm">Zpět na Kanban</a>
        </div>
        <div className="card-body">
          <form onSubmit={addTag} className="row g-3 mb-4 align-items-end">
            <div className="col-md-4">
              <label className="form-label fw-bold small text-uppercase">Název tagu</label>
              <input type="text" className="form-control" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Např. Urgentní..." />
            </div>
            <div className="col-md-2">
              <label className="form-label fw-bold small text-uppercase">Barva</label>
              <input type="color" className="form-control form-control-color w-100" value={newColor} onChange={e => setNewColor(e.target.value)} />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">Přidat</button>
            </div>
          </form>

          <div className="d-flex flex-wrap gap-3">
            {tags.map(tag => (
              <div key={tag.id} className="p-3 border rounded shadow-sm bg-white d-flex align-items-center gap-3">
                <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: tag.color + '20', color: tag.color, border: `1px solid ${tag.color}40` }}>
                  🏷️ {tag.name}
                </span>
                <button 
                  className="btn btn-link text-danger p-0" 
                  onClick={async () => { if(confirm('Smazat tag?')) { await fetch(`/api/tags/${tag.id}`, { method: 'DELETE' }); loadTags(); } }}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}