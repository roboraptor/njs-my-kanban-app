'use client';
import React, { useState, useEffect } from 'react';

interface Person {
  id: string;
  name: string;
  is_questioner: number;
  is_assignee: number;
}

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function NewIssueModal({ onClose, onSaved }: Props) {
  const [people, setPeople] = useState<Person[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/people').then(res => res.json()).then(setPeople);
    fetch('/api/tags').then(res => res.json()).then(setAllTags);
  }, []);

  const toggleTag = (id: string) => {
    setSelectedTags(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id) // Pokud už tam je, odeber ho
        : [...prev, id]              // Pokud tam není, přidej ho
    );
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append('tags', JSON.stringify(selectedTags));
    
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        body: formData, // FormData automaticky nastaví správný Content-Type pro soubory
      });

      if (res.ok) {
        onSaved(); // Refreshne seznam v page.tsx
        onClose(); // Zavře modal
      } else {
        alert('Chyba při ukládání');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const questioners = people.filter(p => p.is_questioner === 1);
  const assignees = people.filter(p => p.is_assignee === 1);
  const others = (type: 'q' | 'a') => people.filter(p => type === 'q' ? !p.is_questioner : !p.is_assignee);

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <form onSubmit={handleSubmit} className="modal-content shadow-lg border-0">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title text-white">➕ Nová otázka / Úkol</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            <div className="mb-3">
              <label className="form-label fw-bold">Co je potřeba vyřešit?</label>
              <input type="text" name="title" className="form-control" placeholder="Stručný popis..." required />
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Zadavatel</label>
                <select name="author" className="form-select" required>
                  <option value="">Vyberte...</option>
                  <optgroup label="Doporučení">
                    {questioners.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </optgroup>
                  <optgroup label="Ostatní">
                    {others('q').map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </optgroup>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">S kým řešit</label>
                <select name="assignee" className="form-select" required>
                  <option value="">Vyberte...</option>
                  <optgroup label="Doporučení">
                    {assignees.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </optgroup>
                  <optgroup label="Ostatní">
                    {others('a').map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="row">
            <div className="col-md-12 mb-3">
                <label className="form-label fw-bold">Referenční kód (např. ID zakázky)</label>
                <input type="text" name="ref_code" className="form-control" placeholder="ABC-123..." />
            </div>
            </div>

            <div className="mb-3">
            <label className="form-label fw-bold">Detailní popis</label>
            <textarea name="description" className="form-control" rows={4} placeholder="Zde rozepište detaily..."></textarea>
            </div>

            {/* SEKCE PRO TAGY */}
            <div className="mb-3">
              <label className="form-label fw-bold small text-uppercase">Kategorizace (Tagy)</label>
              <div className="d-flex flex-wrap gap-2 p-2 border rounded bg-light">
                {allTags.map(tag => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`badge rounded-pill border fw-normal px-3 py-2 transition-all ${selectedTags.includes(tag.id) ? 'shadow-sm' : 'opacity-50'}`}
                    style={{ 
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color + '25' : '#fff', 
                      color: tag.color, 
                      borderColor: tag.color,
                      cursor: 'pointer'
                    }}
                  >
                    {selectedTags.includes(tag.id) ? '✅ ' : '🏷️ '} {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Příloha (obrázek)</label>
              <input type="file" name="image" className="form-control" accept="image/*" />
              <div className="form-text">Obrázek se uloží přímo do databáze.</div>
            </div>
          </div>
          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Zrušit</button>
            <button type="submit" className="btn btn-primary px-4" disabled={loading}>
              {loading ? 'Ukládám...' : 'Vytvořit úkol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}