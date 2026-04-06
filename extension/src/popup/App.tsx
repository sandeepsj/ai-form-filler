import { useState } from 'react';
import { useStorage } from './hooks/useStorage.js';
import { FillPage } from './components/FillPage.js';
import { ProfilesPage } from './components/ProfilesPage.js';
import { SettingsPage } from './components/SettingsPage.js';

type Tab = 'fill' | 'profiles' | 'settings';

export function App() {
  const [tab, setTab] = useState<Tab>('fill');
  const { settings, loading, update } = useStorage();

  if (loading || !settings) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>Loading...</div>;
  }

  return (
    <div>
      <header style={headerStyle}>
        <h1 style={{ fontSize: 16, fontWeight: 700 }}>AI Form Filler</h1>
      </header>

      <nav style={navStyle}>
        {(['fill', 'profiles', 'settings'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...tabStyle,
              borderBottom: tab === t ? '2px solid #4285f4' : '2px solid transparent',
              color: tab === t ? '#4285f4' : '#666',
            }}
          >
            {t === 'fill' ? 'Fill' : t === 'profiles' ? 'Profiles' : 'Settings'}
          </button>
        ))}
      </nav>

      {tab === 'fill' && <FillPage settings={settings} />}
      {tab === 'profiles' && <ProfilesPage settings={settings} onUpdate={update} />}
      {tab === 'settings' && <SettingsPage settings={settings} onUpdate={update} />}
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #e0e0e0',
  background: '#fafafa',
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  borderBottom: '1px solid #e0e0e0',
};

const tabStyle: React.CSSProperties = {
  flex: 1,
  padding: '10px 0',
  background: 'none',
  border: 'none',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'color 0.15s',
};
