// src/app/settings/page.tsx
'use client';
import React, { useState } from 'react';
import GeneralSettings from '@/components/settings/GeneralSettings';
import ProjectSettings from '@/components/settings/ProjectSettings';
import PeopleSettings from '@/components/settings/PeopleSettings';
import TagsSettings from '@/components/settings/TagsSettings';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="container py-4">
      <h1 className="mb-4 fw-bold">⚙️ Nastavení aplikace</h1>

      <div className="row">
        <div className="col-md-3">
          <div className="list-group">
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              🏢 Obecné
            </button>
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'projects' ? 'active' : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              🏷️ Projekty a Prefixy
            </button>
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'people' ? 'active' : ''}`}
              onClick={() => setActiveTab('people')}
            >
              👥 Lidé a Oprávnění
            </button>
            <button 
              className={`list-group-item list-group-item-action ${activeTab === 'tags' ? 'active' : ''}`}
              onClick={() => setActiveTab('tags')}
            >
              🏷️ Tagy
            </button>
          </div>
        </div>

        <div className="col-md-9">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              
              {activeTab === 'general' && <GeneralSettings />}
              {activeTab === 'projects' && <ProjectSettings />}
              {activeTab === 'people' && <PeopleSettings />}

              {activeTab === 'tags' && <TagsSettings />}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
