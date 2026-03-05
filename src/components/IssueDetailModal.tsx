'use client';
import React, { useState, useEffect } from 'react';
import { parseDescription } from '@/utils/textParser';

interface Person { id: string; name: string; }
interface Tag { id: string; name: string; color: string; }

interface Issue {
  id: string; title: string; description: string; ref_code: string; issue_id: string;
  author: string; assignee: string; status: string; has_image: number;
  tag_list: string | null;
  tag_ids: string | null;
  is_archived?: number;
}

interface IssueLink {
  id: number;
  source_issue_id: string;
  target_issue_id: string;
  type: string;
  source_readable_id: string;
  target_readable_id: string;
  source_title: string;
  target_title: string;
}

export default function IssueDetailModal({ issue, onClose, onSaved }: { issue: Issue, onClose: () => void, onSaved: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [formData, setFormData] = useState({ ...issue });
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State pro vazby
  const [links, setLinks] = useState<IssueLink[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]); // Pro výběr v dropdownu
  const [newLinkType, setNewLinkType] = useState('relates_to');
  const [newLinkTargetId, setNewLinkTargetId] = useState('');

  useEffect(() => {
    fetch('/api/people').then(res => res.json()).then(setPeople);
    fetch('/api/tags').then(res => res.json()).then(setAllTags);
    fetch('/api/issues').then(res => res.json()).then(setAllIssues); // Načteme všechny úkoly pro výběr vazby
    loadLinks();

    if (issue.tag_ids) {
      setSelectedTagIds(issue.tag_ids.split(','));
    }
  }, []);

  const loadLinks = () => {
    fetch(`/api/links?issue_id=${issue.id}`).then(res => res.json()).then(setLinks);
  };

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

  const handleArchive = async () => {
    if (!confirm('Opravdu archivovat tento úkol? Zmizí z nástěnky.')) return;
    await fetch(`/api/issues/${issue.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_archived: 1 })
    });
    onSaved();
    onClose();
  };

  const handleAddLink = async () => {
    if (!newLinkTargetId) return;

    // Logika pro směrovost vazeb
    let source = issue.id;
    let target = newLinkTargetId;
    let type = newLinkType;

    // Zpracování inverzních nebo speciálních vazeb
    if (newLinkType === 'blocked_by') {
      // "Tento úkol je blokován [vybraným]" => "[Vybraný] blokuje [tento]"
      source = newLinkTargetId;
      target = issue.id;
      type = 'blocks';
    } else if (newLinkType === 'child_of') {
      // "Tento úkol je potomkem [vybraného]" => "[Vybraný] je rodičem [tohoto]"
      source = newLinkTargetId;
      target = issue.id;
      type = 'parent_of';
    } else if (newLinkType === 'parent_of') {
      // "Tento úkol je rodičem [vybraného]"
      type = 'parent_of';
    }

    await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_issue_id: source, target_issue_id: target, type })
    });

    setNewLinkTargetId('');
    loadLinks();
  };

  const handleDeleteLink = async (linkId: number) => {
    await fetch(`/api/links/${linkId}`, { method: 'DELETE' });
    loadLinks();
  };

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-light border-0">
            <h5 className="modal-title fw-bold text-muted small text-uppercase">
              {isEditing ? 'Režim úprav' : `Detail požadavku ${issue.issue_id || '#' + issue.id.substring(0,4)}`}
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
                    {parseDescription(issue.description)}
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

                {/* SEKCE VAZBY (Issue Linking) */}
                <div className="mb-4 pt-3 border-top">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="text-uppercase small fw-bold text-muted">🔗 Vazby na jiné úkoly</label>
                  </div>
                  
                  <div className="list-group list-group-flush border rounded">
                    {/* Hierarchické vazby (Rodič/Potomek) */}
                    {links.filter(l => l.type === 'parent_of').map(link => {
                      const isParent = link.source_issue_id === issue.id;
                      const label = isParent ? 'Potomek' : 'Rodič';
                      const color = 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25';
                      const otherIssue = isParent
                        ? { id: link.target_readable_id, title: link.target_title }
                        : { id: link.source_readable_id, title: link.source_title };
                      
                      return (
                        <div key={link.id} className="list-group-item d-flex justify-content-between align-items-center p-2">
                          <div>
                            <span className={`badge ${color} me-2`}>{label}</span>
                            <a href={`/${otherIssue.id}`} className="text-decoration-none fw-bold">{otherIssue.id}</a>
                            <span className="text-muted ms-2 small">{otherIssue.title}</span>
                          </div>
                          {isEditing && <button className="btn btn-sm text-danger" onClick={() => handleDeleteLink(link.id)}><i className="bi bi-x-lg"></i></button>}
                        </div>
                      );
                    })}

                    {/* Ostatní vazby (Blokuje/Souvisí) */}
                    {links.filter(l => l.type !== 'parent_of').map(link => {
                      const isSource = link.source_issue_id === issue.id;
                      // Určení popisku a barvy podle typu a směru
                      let label = 'Souvisí s';
                      let color = 'bg-info text-dark';
                      
                      if (link.type === 'blocks') {
                        if (isSource) { label = 'Blokuje'; color = 'bg-danger text-white'; }
                        else { label = 'Blokováno'; color = 'bg-warning text-dark'; }
                      }

                      const otherIssue = isSource 
                        ? { id: link.target_readable_id, title: link.target_title }
                        : { id: link.source_readable_id, title: link.source_title };

                      return (
                        <div key={link.id} className="list-group-item d-flex justify-content-between align-items-center p-2">
                          <div>
                            <span className={`badge ${color} me-2`}>{label}</span>
                            <a href={`/${otherIssue.id}`} className="text-decoration-none fw-bold">{otherIssue.id}</a>
                            <span className="text-muted ms-2 small">{otherIssue.title}</span>
                          </div>
                          {isEditing && (
                            <button className="btn btn-sm text-danger" onClick={() => handleDeleteLink(link.id)}>
                              <i className="bi bi-x-lg"></i>
                            </button>
                          )}
                        </div>
                      );
                    })}
                    
                    {links.length === 0 && !isEditing && <div className="p-3 text-muted small text-center">Žádné vazby</div>}
                  </div>

                  {/* Formulář pro přidání vazby (jen v editaci) */}
                  {isEditing && (
                    <div className="mt-2 d-flex gap-2">
                      <select className="form-select form-select-sm" style={{width: '160px'}} value={newLinkType} onChange={e => setNewLinkType(e.target.value)}>
                        <option value="relates_to">Souvisí s</option>
                        <option value="blocks">Blokuje</option>
                        <option value="blocked_by">Je blokován</option>
                        <option value="parent_of">Je rodičem</option>
                        <option value="child_of">Je potomkem</option>
                      </select>
                      <select className="form-select form-select-sm" value={newLinkTargetId} onChange={e => setNewLinkTargetId(e.target.value)}>
                        <option value="">Vyberte úkol...</option>
                        {allIssues.filter(i => i.id !== issue.id).map(i => <option key={i.id} value={i.id}>{i.issue_id} - {i.title}</option>)}
                      </select>
                      <button className="btn btn-sm btn-success text-nowrap" onClick={handleAddLink}>+ Přidat</button>
                    </div>
                  )}
                </div>
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
                  <label className="text-uppercase small fw-bold text-muted d-block mb-2">Externí Reference</label>
                  {isEditing ? (
                    <input 
                      className="form-control border-primary" 
                      value={formData.ref_code} 
                      onChange={e => setFormData({...formData, ref_code: e.target.value})} 
                    />
                  ) : (
                    <span className="text-dark">{issue.ref_code || <em className="text-muted small">Nezadáno</em>}</span>
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
            {!isEditing && (
              <button className="btn btn-outline-secondary me-2" onClick={handleArchive} title="Archivovat">
                <i className="bi bi-archive-fill me-1"></i> Archivovat
              </button>
            )}
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