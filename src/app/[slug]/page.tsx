// src/app/[slug]/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import IssueDetailModal from '@/components/IssueDetailModal';
import type { Issue } from '@/app/page'; // Reusing type from main page

export default function IssueDirectPage() {
  const params = useParams();
  const router = useRouter();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // In a real app, you would have an endpoint like /api/issues/by-code/:code
    // Here we fetch all and find (prototype only)
    fetch('/api/issues')
      .then(res => res.json())
      .then((data: Issue[]) => {
        const found = data.find(i => i.issue_id === params.slug || i.id === params.slug);
        if (found) {
          setIssue(found);
        } else {
          setError('Úkol nenalezen');
        }
      })
      .catch(err => setError('Chyba načítání'))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) return <div className="p-5 text-center">Načítám úkol {params.slug}...</div>;
  if (error) return <div className="p-5 text-center text-danger fw-bold">{error}</div>;

  return (
    <div className="container py-4">
      {issue && (
        <IssueDetailModal 
          issue={issue} 
          onClose={() => router.push('/')} 
          onSaved={() => window.location.reload()} 
        />
      )}
    </div>
  );
}
