// src/components/settings/GeneralSettings.tsx
import React, { useEffect, useState } from 'react';

export default function GeneralSettings() {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    org_name: '',
    header_org_name: '',
    color: '#0074da',
    website: '',
    logo_url: '',
    email: '',
    phone: '',
    description: ''
  });

  useEffect(() => {
    fetch('/api/general')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          if (Object.keys(data).length > 0) {
             setFormData(prev => ({ ...prev, ...data }));
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('Nastavení uloženo');
      } else {
        alert('Chyba při ukládání');
      }
    } catch (error) {
      console.error(error);
      alert('Chyba při ukládání');
    }
  };

  if (loading) return <div>Načítání...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <h4 className="mb-3">Obecné nastavení</h4>
      
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Název organizace</label>
          <input 
            type="text" 
            className="form-control" 
            name="org_name"
            value={formData.org_name || ''} 
            onChange={handleChange} 
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold">Název v hlavičce</label>
          <input 
            type="text" 
            className="form-control" 
            name="header_org_name"
            value={formData.header_org_name || ''} 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">Barva (Brand Color)</label>
        <div className="d-flex align-items-center gap-2">
            <input 
                type="color" 
                className="form-control form-control-color" 
                name="color"
                value={formData.color || '#0074da'} 
                onChange={handleChange} 
                title="Vyberte barvu"
            />
            <input 
                type="text" 
                className="form-control" 
                style={{ width: '100px' }}
                name="color"
                value={formData.color || ''} 
                onChange={handleChange} 
            />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold">Popis</label>
        <textarea 
            className="form-control" 
            rows={3}
            name="description"
            value={formData.description || ''} 
            onChange={handleChange} 
        ></textarea>
      </div>

      <h5 className="mt-4 mb-3">Kontaktní údaje a Odkazy</h5>
      
      <div className="row">
        <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Webové stránky</label>
            <input 
                type="url" 
                className="form-control" 
                name="website"
                value={formData.website || ''} 
                onChange={handleChange} 
                placeholder="https://..."
            />
        </div>
        <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">URL Loga</label>
            <input 
                type="text" 
                className="form-control" 
                name="logo_url"
                value={formData.logo_url || ''} 
                onChange={handleChange} 
            />
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Email</label>
            <input 
                type="email" 
                className="form-control" 
                name="email"
                value={formData.email || ''} 
                onChange={handleChange} 
            />
        </div>
        <div className="col-md-6 mb-3">
            <label className="form-label fw-bold">Telefon</label>
            <input 
                type="text" 
                className="form-control" 
                name="phone"
                value={formData.phone || ''} 
                onChange={handleChange} 
            />
        </div>
      </div>

      <button type="submit" className="btn btn-primary mt-3">Uložit změny</button>
    </form>
  );
}
