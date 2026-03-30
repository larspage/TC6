import React, { useState, useEffect } from 'react';
import { getUsers, selectUser, getMindmaps, getNodes, getConnections } from './api.js';
import MindMapCanvas from './components/MindMapCanvas.jsx';
import UserPicker from './components/UserPicker.jsx';

export default function App() {
  const [auth, setAuth] = useState(null); // { token, user: { id, username, email } }
  const [map, setMap] = useState({ status: 'idle', nodes: [], connections: [], mapTitle: '', mindmapId: null, error: null });
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving'

  // Load map data when auth changes
  useEffect(() => {
    if (!auth) { setMap({ status: 'idle', nodes: [], connections: [], mapTitle: '', mindmapId: null, error: null }); return; }
    setMap(m => ({ ...m, status: 'loading' }));
    async function loadMap() {
      try {
        const maps = await getMindmaps(auth.token);
        if (!maps.length) throw new Error('No mind maps found');
        const m = maps[0];
        const [nodes, connections] = await Promise.all([
          getNodes(auth.token, m._id),
          getConnections(auth.token, m._id),
        ]);
        setMap({ status: 'ready', nodes, connections, mapTitle: m.title, mindmapId: m._id, error: null });
      } catch (err) {
        setMap(m => ({ ...m, status: 'error', error: err.message }));
      }
    }
    loadMap();
  }, [auth]);

  function handleUserChange(result) {
    setAuth({ token: result.token, user: result.user });
  }

  function handleLogout() {
    setAuth(null);
  }

  // Picker screen
  if (!auth) {
    return <UserSelectScreen onUserChange={handleUserChange} />;
  }

  if (map.status === 'loading') return <Splash text="Loading ThoughtCatcher…" />;
  if (map.status === 'error')   return <Splash text={`Error: ${map.error}`} isError />;

  return (
    <div style={css.app}>
      <header style={css.header}>
        <span style={css.logo}>ThoughtCatcher</span>
        <span style={css.mapName}>{map.mapTitle}</span>
        <div style={css.right}>
          <span style={css.nodeCount}>{map.nodes.length} nodes</span>
          <span style={{ ...css.savePill, ...(saveStatus === 'saving' ? css.savePillSaving : css.savePillSaved) }}>
            {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
          </span>
          <span style={css.greeting}>Hello, {auth.user.username}</span>
          <UserPicker currentUser={auth.user} onUserChange={handleUserChange} />
          <button style={css.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </header>
      <MindMapCanvas
        nodes={map.nodes}
        connections={map.connections}
        token={auth.token}
        mindmapId={map.mindmapId}
        onNodeCreated={(newNode) => setMap(m => ({ ...m, nodes: [...m.nodes, newNode] }))}
        onSaveStart={() => setSaveStatus('saving')}
        onSaveEnd={() => setSaveStatus('saved')}
      />
    </div>
  );
}

function UserSelectScreen({ onUserChange }) {
  return (
    <div style={css.splash}>
      <span style={css.logo}>ThoughtCatcher</span>
      <p style={css.splashSub}>Who's thinking today?</p>
      <UserPicker currentUser={null} onUserChange={onUserChange} defaultOpen />
    </div>
  );
}

function Splash({ text, isError }) {
  return (
    <div style={css.splash}>
      {!isError && <div style={css.spinner} />}
      <p style={{ ...css.splashText, color: isError ? '#ef4444' : '#64748b' }}>{text}</p>
    </div>
  );
}

const css = {
  app: { display: 'flex', flexDirection: 'column', height: '100vh' },
  header: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '10px 20px', background: '#1B3F7B',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)', flexShrink: 0,
  },
  logo: {
    fontSize: '18px', fontWeight: 700, color: '#42B4E6',
    fontFamily: "'Inter','Segoe UI',sans-serif", letterSpacing: '-0.3px',
  },
  mapName: { fontSize: '14px', color: '#CBD5E1', fontFamily: "'Inter','Segoe UI',sans-serif" },
  right: { marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' },
  nodeCount: { fontSize: '12px', color: '#64748b', fontFamily: "'Inter','Segoe UI',sans-serif" },
  savePill: {
    fontSize: '11px', borderRadius: '10px', padding: '2px 8px',
    fontFamily: "'Inter','Segoe UI',sans-serif", transition: 'all 0.3s',
  },
  savePillSaved: { background: 'rgba(34,197,94,0.15)', color: '#4ade80' },
  savePillSaving: { background: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  greeting: { fontSize: '13px', color: '#94a3b8', fontFamily: "'Inter','Segoe UI',sans-serif" },
  logoutBtn: {
    background: 'none', border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '6px', color: '#94a3b8', padding: '4px 10px',
    cursor: 'pointer', fontSize: '12px', fontFamily: "'Inter','Segoe UI',sans-serif",
  },
  splash: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100vh', background: '#0f172a', gap: '16px',
  },
  splashSub: { fontSize: '14px', color: '#64748b', fontFamily: "'Inter','Segoe UI',sans-serif" },
  splashText: { fontSize: '15px', fontFamily: "'Inter','Segoe UI',sans-serif" },
  spinner: {
    width: '36px', height: '36px', borderRadius: '50%',
    border: '3px solid #e2e8f0', borderTopColor: '#42B4E6',
    animation: 'spin 0.7s linear infinite',
  },
};

const style = document.createElement('style');
style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(style);
