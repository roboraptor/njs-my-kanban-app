import React from 'react';
import type { Issue } from '@/app/page'; // Assumes you export the Issue type
import 'bootstrap-icons/font/bootstrap-icons.css';

interface IssueCardProps {
  issue: Issue;
  // You'll need to get the correct type for `provided` from @hello-pangea/dnd
  provided: any; 
  onClick: () => void;
}

// Using React.memo prevents re-rendering if its props (issue, provided, etc.) haven't changed.
const IssueCard = React.memo(({ issue, provided, onClick }: IssueCardProps) => {
  return (
    <div
      className="card mb-2 shadow-sm border-0 card-hover"
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
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
  );
});

IssueCard.displayName = 'IssueCard'; // Good for debugging

export default IssueCard;
