// src/components/settings/PeopleSettings.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';

interface Person {
  id: string;
  name: string;
  is_questioner: number;
  is_assignee: number;
}

export default function PeopleSettings() {
  const [people, setPeople] = useState<Person[]>([]);
  const [newName, setNewName] = useState('');

  const loadPeople = useCallback(() => {
    fetch('/api/people').then(res => res.json()).then(setPeople);
  }, []);

  useEffect(() => {
    loadPeople();
  }, [loadPeople]);

  const addPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    
    await fetch('/api/people', {
      method: 'POST',
      body: JSON.stringify({ name: newName }),
      headers: { 'Content-Type': 'application/json' }
    });
    setNewName('');
    loadPeople();
  };

  const toggleRole = async (person: Person, field: 'is_questioner' | 'is_assignee') => {
    const updatedData = {
        is_questioner: field === 'is_questioner' ? (person.is_questioner ? 0 : 1) : person.is_questioner,
        is_assignee: field === 'is_assignee' ? (person.is_assignee ? 0 : 1) : person.is_assignee,
    };

    try {
        const res = await fetch(`/api/people/${person.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedData)
        });

        if (res.ok) {
          loadPeople();
        }
    } catch (err) {
        console.error("Chyba při ukládání role", err);
    }
  };

  return (
    <div>
      <h4 className="mb-3"><i className="bi bi-people-fill"></i> Správa zadavatelů a řešitelů</h4>
      <form onSubmit={addPerson} className="row g-2 mb-4">
          <div className="col-auto">
          <input 
              type="text" 
              className="form-control" 
              placeholder="Jméno nové osoby" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
          />
          </div>
          <div className="col-auto">
          <button type="submit" className="btn btn-primary">Přidat</button>
          </div>
      </form>

      <table className="table table-hover align-middle">
          <thead className="table-light">
          <tr>
              <th>Jméno</th>
              <th className="text-center">Zadavatel</th>
              <th className="text-center">Assignee</th>
              <th className="text-end">Akce</th>
          </tr>
          </thead>
          <tbody>
          {people.map(p => (
              <tr key={p.id}>
              <td className="fw-bold">{p.name}</td>
              <td className="text-center">
                  <input 
                  type="checkbox" 
                  className="form-check-input"
                  checked={!!p.is_questioner} 
                  onChange={() => toggleRole(p, 'is_questioner')}
                  />
              </td>
              <td className="text-center">
                  <input 
                  type="checkbox" 
                  className="form-check-input"
                  checked={!!p.is_assignee} 
                  onChange={() => toggleRole(p, 'is_assignee')}
                  />
              </td>
              <td className="text-end">
                  <button 
                  className="btn btn-outline-danger btn-sm"
                  onClick={async () => { if(confirm('Smazat?')) { await fetch(`/api/people/${p.id}`, { method: 'DELETE' }); loadPeople(); } }}
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
