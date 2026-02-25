'use client';
import React, { useState, useEffect } from 'react';

interface Person { id: string; name: string; }
interface Tag { id: string; name: string; color: string; }

interface Issue {
  id: string; title: string; description: string; ref_code: string;
  author: string; assignee: string; status: string; has_image: number;
  tag_list: string | null;
}

export default function IssueDetailModal({ issue, onClose, onSaved }: { issue: Issue, onClose: () => void, onSaved: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [formData, setFormData] = useState({ ...issue });
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/people').then(res => res.json()).then(setPeople);
    fetch('/api/tags').then(res => res.json()).then(setAllTags);

    // Inicializace vybraných tagů z tag_listu (který je ve formátu "Jméno|Barva,Jméno|Barva")
    // Poznámka: Aby toto fungovalo dokonale, musíme v DB/API porovnávat názvy, 
    // ideálně by ale API mělo posílat i pole IDček tagů. 
    // Pro teď to zjednodušíme - pokud uživatel klikne na tagy v editaci, přepíše ty původní.
  }, []);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          tagIds: selectedTagIds, // Posíláme nově vybraná ID tagů
          fullUpdate: true,
        }),
      });

      if (res.ok) {
        onSaved();
        onClose();
      }
    } catch (error) {
      console.error("Chyba při ukládání:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Opravdu chcete tento úkol smazat?')) return;
    await fetch(`/api/issues/${issue.id}`, { method: 'DELETE' });
    onSaved();
    onClose();
  };

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-light border-0">
            <h5 className="modal-title fw-bold text-muted small text-uppercase">
              {isEditing ? 'Režim úprav' : `Detail požadavku #${issue.ref_code || issue.id.substring(0,8)}`}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body p-4">
            <div className="row">
              {/* LEVÁ STRANA: Texty */}
              <div className="col-lg-8 border-end">
                <div className="mb-4">
                  <label className="text-uppercase small fw-bold text-muted d-block mb-2">Název úkolu</label>
                  {isEditing ? (
                    <input 
                      className="form-control form-control-lg fw-bold border-primary" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})} 
                    />
                  ) : (
                    <h2 className="fw-bold m-0">{issue.title}</h2>
                  )}
                </div>

                <label className="text-uppercase small fw-bold text-muted d-block mb-2">Podrobný popis</label>
                {isEditing ? (
                  <textarea 
                    className="form-control mb-4 border-primary" 
                    rows={10} 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                  />
                ) : (
                  <div className="bg-white border rounded p-3 mb-4 shadow-sm" style={{ whiteSpace: 'pre-wrap', minHeight: '150px' }}>
                    {issue.description || <em className="text-muted">Žádný popis...</em>}
                  </div>
                )}

                {issue.has_image === 1 && (
                  <div className="mb-4">
                    <label className="text-uppercase small fw-bold text-muted d-block mb-2">Příloha</label>
                    <img 
                      src={`/api/issues/${issue.id}/image`} 
                      className="img-fluid rounded border shadow-sm" 
                      alt="Příloha" 
                      style={{ maxHeight: '400px', cursor: 'pointer' }}
                      onClick={() => window.open(`/api/issues/${issue.id}/image`, '_blank')}
                    />
                  </div>
                )}
              </div>

              {/* PRAVÁ STRANA: Atributy */}
              <div className="col-lg-4 ps-lg-4">
                
                {/* ZADAVATEL */}
                <div className="mb-4">
                  <label className="text-uppercase small fw-bold text-muted d-block mb-2">👤 Zadavatel</label>
                  {isEditing ? (
                    <select 
                      className="form-select border-primary" 
                      value={formData.author} 
                      onChange={e => setFormData({...formData, author: e.target.value})}
                    >
                      {people.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  ) : (
                    <div className="d-flex align-items-center p-2 bg-light rounded border">
                      <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                        {issue.author.charAt(0)}
                      </div>
                      <span className="fw-medium">{issue.author}</span>
                    </div>
                  )}
                </div>

                {/* ŘEŠITEL */}
                <div className="mb-4">
                  <label className="text-uppercase small fw-bold text-primary d-block mb-2">🤝 Řešitel</label>
                  {isEditing ? (
                    <select 
                      className="form-select border-primary" 
                      value={formData.assignee} 
                      onChange={e => setFormData({...formData, assignee: e.target.value})}
                    >
                      {people.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  ) : (
                    <div className="d-flex align-items-center p-2 bg-white rounded border shadow-sm border-primary">
                      <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                        {issue.assignee.charAt(0)}
                      </div>
                      <span className="fw-bold">{issue.assignee}</span>
                    </div>
                  )}
                </div>

                {/* REF KÓD */}
                <div className="mb-4">
                  <label className="text-uppercase small fw-bold text-muted d-block mb-2">Referenční kód</label>
                  {isEditing ? (
                    <input 
                      className="form-control border-primary" 
                      value={formData.ref_code} 
                      onChange={e => setFormData({...formData, ref_code: e.target.value})} 
                    />
                  ) : (
                    <code className="h6 text-primary">{issue.ref_code || '---'}</code>
                  )}
                </div>

                {/* TAGY */}
                <div className="mb-4">
                  <label className="text-uppercase small fw-bold text-muted d-block mb-2">Tagy</label>
                  {isEditing ? (
                    <div className="d-flex flex-wrap gap-1 p-2 border rounded bg-white border-primary">
                      {allTags.map(tag => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`btn btn-sm ${selectedTagIds.includes(tag.id) ? '' : 'opacity-50'}`}
                          style={{ 
                            backgroundColor: tag.color + (selectedTagIds.includes(tag.id) ? '30' : '10'),
                            color: tag.color,
                            border: `1px solid ${tag.color}${selectedTagIds.includes(tag.id) ? '80' : '20'}`
                          }}
                        >
                          {selectedTagIds.includes(tag.id) ? '✅ ' : ''}{tag.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">
                      {issue.tag_list ? issue.tag_list.split(',').map((t, i) => {
                        const [name, color] = t.split('|');
                        return <span key={i} className="badge border" style={{ backgroundColor: color + '15', color: color }}>{name}</span>
                      }) : <small className="text-muted italic">bez tagů</small>}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          <div className="modal-footer bg-light border-0">
            <button className="btn btn-outline-danger me-auto" onClick={handleDelete}>Smazat</button>
            <button className="btn btn-link text-muted" onClick={onClose}>Zavřít</button>
            
            {!isEditing ? (
              <button className="btn btn-primary px-4" onClick={() => setIsEditing(true)}>Upravit</button>
            ) : (
              <>
                <button className="btn btn-outline-secondary" onClick={() => setIsEditing(false)}>Zrušit</button>
                <button className="btn btn-success px-4" onClick={handleSave} disabled={loading}>
                  {loading ? 'Ukládám...' : 'Uložit změny'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}