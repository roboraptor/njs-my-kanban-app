// src/utils/textParser.tsx
import React from 'react';
import Link from 'next/link';

/**
 * Parses text and replaces issue references (e.g. #JR-123 or JR-123) with clickable links.
 */
export const parseDescription = (text: string | null | undefined) => {
  if (!text) return <em className="text-muted">Žádný popis...</em>;

  // Regex matches #PREFIX-NUMBER or PREFIX-NUMBER (assuming uppercase prefix)
  const regex = /(#?([A-Z]+-\d+))/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    // If the part matches the issue key format
    if (part.match(/^[A-Z]+-\d+$/) || part.match(/^#[A-Z]+-\d+$/)) {
      const cleanRef = part.replace('#', '');
      return (
        <Link 
          key={i} 
          href={`/`} 
          className="text-primary fw-bold text-decoration-none hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
      );
    }
    return part;
  });
};
