import { useState } from 'react';
import type { ExtensionStorage, DataProfile } from '../../shared/storage-keys.js';

interface Props {
  settings: ExtensionStorage;
  onUpdate: (partial: Partial<ExtensionStorage>) => Promise<void>;
}

export function ProfilesPage({ settings, onUpdate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [data, setData] = useState('');

  const startNew = () => {
    setEditingId('new');
    setName('');
    setData('');
  };

  const startEdit = (profile: DataProfile) => {
    setEditingId(profile.id);
    setName(profile.name);
    setData(profile.data);
  };

  const handleSave = async () => {
    if (!name.trim() || !data.trim()) return;

    const profiles = [...settings.profiles];
    if (editingId === 'new') {
      const id = crypto.randomUUID();
      profiles.push({ id, name: name.trim(), data: data.trim() });
    } else {
      const idx = profiles.findIndex((p) => p.id === editingId);
      if (idx >= 0) {
        profiles[idx] = { id: editingId!, name: name.trim(), data: data.trim() };
      }
    }
    await onUpdate({ profiles });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const profiles = settings.profiles.filter((p) => p.id !== id);
    const selectedProfileIds = settings.selectedProfileIds.filter((sid) => sid !== id);
    await onUpdate({ profiles, selectedProfileIds });
  };

  const toggleSelected = async (id: string) => {
    const selected = settings.selectedProfileIds.includes(id)
      ? settings.selectedProfileIds.filter((sid) => sid !== id)
      : [...settings.selectedProfileIds, id];
    await onUpdate({ selectedProfileIds: selected });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setData(reader.result as string);
      if (!name.trim()) setName(file.name.replace(/\.[^.]+$/, ''));
    };
    reader.readAsText(file);
  };

  if (editingId) {
    return (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600 }}>
            {editingId === 'new' ? 'New Profile' : 'Edit Profile'}
          </h3>
          <button onClick={() => setEditingId(null)} style={linkBtnStyle}>Cancel</button>
        </div>

        <div>
          <label style={labelStyle}>Profile Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., My Resume, Home Address, Company Info"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Data</label>
          <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Paste any text — resume, personal details, company info, etc."
            rows={10}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <label style={labelStyle}>Or upload a file (.txt, .json)</label>
          <input type="file" accept=".txt,.json,.csv,.md" onChange={handleFileUpload} />
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim() || !data.trim()}
          style={{
            ...buttonStyle,
            opacity: !name.trim() || !data.trim() ? 0.5 : 1,
          }}
        >
          Save Profile
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: 14, fontWeight: 600 }}>Data Profiles</h3>
        <button onClick={startNew} style={buttonStyle}>+ Add Profile</button>
      </div>

      {settings.profiles.length === 0 && (
        <p style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: 24 }}>
          No profiles yet. Add one to get started.
        </p>
      )}

      {settings.profiles.map((profile) => (
        <div
          key={profile.id}
          style={{
            border: '1px solid #e0e0e0',
            borderRadius: 8,
            padding: 12,
            background: settings.selectedProfileIds.includes(profile.id) ? '#e8f0fe' : '#fafafa',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              <input
                type="checkbox"
                checked={settings.selectedProfileIds.includes(profile.id)}
                onChange={() => toggleSelected(profile.id)}
              />
              {profile.name}
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => startEdit(profile)} style={linkBtnStyle}>Edit</button>
              <button onClick={() => handleDelete(profile.id)} style={{ ...linkBtnStyle, color: '#d93025' }}>Delete</button>
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profile.data.slice(0, 100)}{profile.data.length > 100 ? '...' : ''}
          </p>
        </div>
      ))}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  fontSize: 12,
  marginBottom: 4,
  color: '#555',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '1px solid #ddd',
  borderRadius: 6,
  fontSize: 13,
  outline: 'none',
};

const buttonStyle: React.CSSProperties = {
  padding: '6px 12px',
  background: '#4285f4',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};

const linkBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#4285f4',
  fontSize: 12,
  cursor: 'pointer',
  padding: 0,
};
