// src/components/settings/ProjectSettings.tsx
'use client';
import React, { useState, useEffect } from 'react';

interface Project {
  id: number;
  prefix: string;
  name: string;
  counter: number;
}

export default function ProjectSettings() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newPrefix, setNewPrefix] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetch('/api/projects').then(res => res.json()).then(setProjects);
  }, []);

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: newPrefix, name: newName })
    });
    
    if (res.ok) {
      const project = await res.json();
      setProjects([...projects, project]);
      setNewPrefix('');
      setNewName('');
    } else {
      alert('Chyba: Prefix pravděpodobně již existuje.');
    }
  };

  return (
    <div>
      <h4 className="mb-3"><i className="bi bi-kanban-fill"></i> Správa projektů (Prefixy)</h4>
      
      <form onSubmit={addProject} className="row g-2 mb-4 align-items-end">
        <div className="col-auto">
          <label className="form-label small fw-bold">Název projektu</label>
          <input 
            type="text" 
            className="form-control" 
            placeholder="Např. Marketing" 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            required 
          />
        </div>
        <div className="col-auto">
          <label className="form-label small fw-bold">Prefix (Klíč)</label>
          <input 
            type="text" 
            className="form-control text-uppercase" 
            placeholder="MKT" 
            maxLength={5} 
            value={newPrefix} 
            onChange={e => setNewPrefix(e.target.value.toUpperCase())} 
            required 
          />
        </div>
        <div className="col-auto">
          <button className="btn btn-success">Přidat</button>
        </div>
      </form>

      <table className="table table-hover">
        <thead className="table-light">
          <tr>
            <th>Název projektu</th>
            <th>Klíč (Prefix)</th>
            <th>Počítadlo</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td><code>{p.prefix}</code></td>
              <td>{p.counter}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
