// src/components/settings/TagsSettings.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';

interface Tag {
  id: string;
  name: string;
  color: string;
}

export default function TagsSettings() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6c757d'); // Default gray

  const loadTags = useCallback(() => {
    fetch('/api/tags').then(res => res.json()).then(setTags);
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const addTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    
    await fetch('/api/tags', {
      method: 'POST',
      body: JSON.stringify({ name: newName, color: newColor }),
      headers: { 'Content-Type': 'application/json' }
    });
    setNewName('');
    setNewColor('#6c757d');
    loadTags();
  };

  const deleteTag = async (id: string) => {
    if (!confirm('Opravdu smazat tento tag?')) return;
    await fetch(`/api/tags/${id}`, { method: 'DELETE' });
    loadTags();
  };

  return (
    <div>
      <h4 className="mb-3"><i className="bi bi-tag-fill"></i> Správa tagů</h4>
      <form onSubmit={addTag} className="row g-2 mb-4 align-items-end">
          <div className="col-auto">
            <label className="form-label small fw-bold">Název tagu</label>
            <input 
                type="text" 
                className="form-control" 
                placeholder="Např. Bug" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
            />
          </div>
          <div className="col-auto">
            <label className="form-label small fw-bold">Barva</label>
            <input 
                type="color" 
                className="form-control form-control-color" 
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
                title="Vyberte barvu"
            />
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-primary">Přidat</button>
          </div>
      </form>

      <table className="table table-hover align-middle">
          <thead className="table-light">
          <tr>
              <th>Náhled</th>
              <th>Název</th>
              <th>Kód barvy</th>
              <th className="text-end">Akce</th>
          </tr>
          </thead>
          <tbody>
          {tags.map(tag => (
              <tr key={tag.id}>
              <td>
                  <span className="badge rounded-pill border fw-normal" 
                        style={{ backgroundColor: tag.color + '15', color: tag.color, borderColor: tag.color + '30' }}>
                    {tag.name}
                  </span>
              </td>
              <td className="fw-bold">{tag.name}</td>
              <td className="text-muted small font-monospace">{tag.color}</td>
              <td className="text-end">
                  <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => deleteTag(tag.id)}
                  >
                  <i className="bi bi-trash"></i>
                  </button>
              </td>
              </tr>
          ))}
          </tbody>
      </table>
    </div>
  );
}
