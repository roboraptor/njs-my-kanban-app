// src/components/settings/GeneralSettings.tsx
import React from 'react';

export default function GeneralSettings() {
  return (
    <div>
      <h4 className="mb-3">Obecné nastavení</h4>
      <div className="mb-3">
        <label className="form-label fw-bold">Název organizace</label>
        <input type="text" className="form-control" defaultValue="Moje Firma s.r.o." />
      </div>
      <button className="btn btn-primary">Uložit</button>
    </div>
  );
}
