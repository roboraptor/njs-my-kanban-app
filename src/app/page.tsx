'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Přidáno pro sledování URL
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import NewIssueModal from '@/components/NewIssueModal';
import IssueDetailModal from '@/components/IssueDetailModal'; // Předpokládám, že jsi vytvořil tento soubor
import IssueCard from '@/components/IssueCard';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Definice typu pro náš úkol
export interface Issue { // Exporting for use in other components
  id: string;
  title: string;
  description: string;
  ref_code: string;
  issue_id: string; // Nové pole pro Human-Readable ID (např. DEV-1)
  author: string;
  assignee: string;
  status: 'backlog' | 'waiting' | 'done';
  has_image: number;
  created_at: string;
  tag_list: string | null;
  tag_ids: string | null;
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
  
  const isNewModalOpen = searchParams.get('new') === 'true';

  const loadIssues = useCallback(() => {
    fetch('/api/issues')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setIssues(data))
      .catch(error => console.error("Failed to load issues:", error));
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const issuesByStatus = useMemo(() => {
    const grouped: Record<Issue['status'], Issue[]> = {
      backlog: [],
      waiting: [],
      done: [],
    };
    for (const issue of issues) {
      // Ensure status is valid before grouping
      if (grouped[issue.status]) {
        grouped[issue.status].push(issue);
      }
    }
    return grouped;
  }, [issues]);

  const closeNewModal = useCallback(() => {
    router.push('/'); // Vrátí URL na čistý základ
  }, [router]);
  
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
  }; // Not wrapping in useCallback as it depends on `issues` which changes often.

  // Funkce pro otevření detailu a změnu URL (např. na /DEV-1)
  const openIssueDetail = (issue: Issue) => {
    setSelectedIssue(issue);
    if (issue.issue_id) {
      window.history.pushState(null, '', `/${issue.issue_id}`);
    }
  };

  const closeIssueDetail = () => {
    setSelectedIssue(null);
    window.history.pushState(null, '', '/');
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
          onClose={closeIssueDetail} 
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
                      {issuesByStatus[col.id as Issue['status']]
                        .map((issue, index) => (
                          <Draggable key={issue.id} draggableId={issue.id} index={index}>
                            {(provided) => (
                              <IssueCard
                                issue={issue}
                                provided={provided}
                                onClick={() => openIssueDetail(issue)}
                              />
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