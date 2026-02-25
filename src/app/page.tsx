'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Přidáno pro sledování URL
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import NewIssueModal from '@/components/NewIssueModal';
import IssueDetailModal from '@/components/IssueDetailModal'; // Předpokládám, že jsi vytvořil tento soubor
import 'bootstrap-icons/font/bootstrap-icons.css';

// Definice typu pro náš úkol
interface Issue {
  id: string;
  title: string;
  description: string;
  ref_code: string;
  author: string;
  assignee: string;
  status: 'backlog' | 'waiting' | 'done';
  has_image: number;
  created_at: string;
  tag_list: string | null;
}

const COLUMNS = [
  { id: 'backlog', title: <><i className="bi bi-inbox-fill me-2"></i>Nové / Inbox</> },
  { id: 'waiting', title: <><i className="bi bi-cone-striped me-2 text-warning"></i>V řešení</> },
  { id: 'done', title: <><i className="bi bi-check-all me-2 text-success"></i>Hotovo (Log)</> },
];

export default function KanbanPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null); // Stav pro detail úkolu

  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Zjistíme, zda má být otevřen modal pro nový úkol z URL (?new=true)
  const isNewModalOpen = searchParams.get('new') === 'true';

  const loadIssues = () => {
    fetch('/api/issues')
      .then(res => res.json())
      .then(data => setIssues(data));
  };

  useEffect(() => {
    loadIssues();
  }, []);

  const closeNewModal = () => {
    router.push('/'); // Vrátí URL na čistý základ
  };
  
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const updatedIssues = issues.map(issue => {
      if (issue.id === draggableId) {
        return { ...issue, status: destination.droppableId as Issue['status'] };
      }
      return issue;
    });
    setIssues(updatedIssues);

    try {
      await fetch(`/api/issues/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: destination.droppableId }),
      });
    } catch (err) {
      console.error("Nepodařilo se uložit změnu stavu", err);
      loadIssues(); // V případě chyby načteme původní stav
    }
  };

  return (
    <div className="container ">

      {/* Modaly */}
      {isNewModalOpen && (
        <NewIssueModal 
          onClose={closeNewModal}
          onSaved={() => { loadIssues(); closeNewModal(); }} 
        />
      )}

      {selectedIssue && (
        <IssueDetailModal 
          issue={selectedIssue} 
          onClose={() => setSelectedIssue(null)} 
          onSaved={loadIssues} 
        />
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="row g-3">
          {COLUMNS.map(col => (
            <div key={col.id} className="col-md-4">
              <div className="card border-0 shadow-sm" style={{ backgroundColor: '#f4f5f7', minHeight: '80vh' }}>
                <div className="card-header bg-transparent border-0 fw-bold pt-3 pb-2 text-uppercase small text-muted">
                  {col.title}
                </div>
                
                <Droppable droppableId={col.id}>
                  {(provided) => (
                    <div
                      className="card-body p-2"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {issues
                        .filter(i => i.status === col.id)
                        .map((issue, index) => (
                          <Draggable key={issue.id} draggableId={issue.id} index={index}>
                            {(provided) => (
                              <div
                                className="card mb-2 shadow-sm border-0 card-hover"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedIssue(issue)} // Otevření detailu
                                style={{ 
                                  ...provided.draggableProps.style,
                                  cursor: 'pointer'
                                }}
                              >
                                <div className="card-body p-3">
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="fw-bold m-0">{issue.title}</h6>
                                    {issue.ref_code && (
                                      <span className="badge bg-light text-dark border small" style={{ fontSize: '0.65rem' }}>
                                        #{issue.ref_code}
                                      </span>
                                    )}
                                  </div>

                                  {issue.description && (
                                    <p className="small text-muted mb-2 text-truncate-2">
                                      {issue.description}
                                    </p>
                                  )}

                                  {/* Tagy */}
                                  <div className="d-flex flex-wrap gap-1 mb-3">
                                    {issue.tag_list && issue.tag_list.split(',').map((tagStr, idx) => {
                                      const [name, color] = tagStr.split('|');
                                      return (
                                        <span key={idx} className="badge rounded-pill border fw-normal" 
                                              style={{ backgroundColor: color + '15', color: color, borderColor: color + '30', fontSize: '0.7rem' }}>
                                          {name}
                                        </span>
                                      );
                                    })}
                                  </div>

                                  {/* Metadata Footer */}
                                  <div className="d-flex justify-content-between align-items-center pt-2 border-top mt-2">
                                    <div className="d-flex gap-2">
                                      <span title="Autor" className="small text-muted"><i className="bi bi-person-circle"></i> {issue.author.split(' ')[0]}</span>
                                      <span title="Řešitel" className="small text-primary"><i className="bi bi-person-badge-fill"></i> {issue.assignee.split(' ')[0]}</span>
                                    </div>
                                    <span className="small text-muted" style={{ fontSize: '0.7rem' }}>
                                      <i className="bi bi-calendar3 me-1"></i>
                                      {new Date(issue.created_at).toLocaleDateString('cs-CZ')}
                                    </span>
                                  </div>

                                  {/* Náhled obrázku (pokud existuje) */}
                                  {issue.has_image === 1 && (
                                    <div className="mt-2 pt-2 border-top text-center text-muted small">
                                      🖼️ Má přílohu
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>

      <style jsx global>{`
        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-hover:hover {
          background-color: #fafafa;
          transform: translateY(-2px);
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </div>
  );
}