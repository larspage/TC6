import React, { useState, useEffect } from 'react';
import { login, getMindmaps, getNodes, getConnections } from './api.js';
import MindMapCanvas from './components/MindMapCanvas.jsx';

export default function App() {
  const [state, setState] = useState({ status: 'loading', nodes: [], connections: [], mapTitle: '', token: null, error: null });

  useEffect(() => {
    async function init() {
      try {
        const { token } = await login('demo@thoughtcatcher.dev', 'Demo1234!');
        const maps = await getMindmaps(token);
        if (!maps.length) throw new Error('No mind maps found in database');
        const map = maps[0];
        const [nodes, connections] = await Promise.all([
          getNodes(token, map._id),
          getConnections(token, map._id),
        ]);
        setState({ status: 'ready', nodes, connections, mapTitle: map.title, mindmapId: map._id, token, error: null });
      } catch (err) {
        setState(s => ({ ...s, status: 'error', error: err.message }));
      }
    }
    init();
  }, []);

  if (state.status === 'loading') return <Splash text="Loading ThoughtCatcher…" />;
  if (state.status === 'error')   return <Splash text={`Error: ${state.error}`} isError />;

  return (
    <div style={css.app}>
      <header style={css.header}>
        <span style={css.logo}>ThoughtCatcher</span>
        <span style={css.mapName}>{state.mapTitle}</span>
        <span style={css.hint}>Scroll to zoom · Drag to pan</span>
      </header>
      <MindMapCanvas
        nodes={state.nodes}
        connections={state.connections}
        token={state.token}
        mindmapId={state.mindmapId}
        onNodeCreated={(newNode) => setState(s => ({ ...s, nodes: [...s.nodes, newNode] }))}
      />
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
  app: {
    display: 'flex', flexDirection: 'column', height: '100vh',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '10px 20px', background: '#1B3F7B',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)', flexShrink: 0,
  },
  logo: {
    fontSize: '18px', fontWeight: 700, color: '#42B4E6',
    fontFamily: "'Inter','Segoe UI',sans-serif", letterSpacing: '-0.3px',
  },
  mapName: {
    fontSize: '14px', color: '#CBD5E1', fontFamily: "'Inter','Segoe UI',sans-serif",
  },
  hint: {
    marginLeft: 'auto', fontSize: '12px', color: '#64748b',
    fontFamily: "'Inter','Segoe UI',sans-serif",
  },
  splash: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100vh', background: '#f8fafc', gap: '16px',
  },
  splashText: {
    fontSize: '15px', fontFamily: "'Inter','Segoe UI',sans-serif",
  },
  spinner: {
    width: '36px', height: '36px', borderRadius: '50%',
    border: '3px solid #e2e8f0', borderTopColor: '#42B4E6',
    animation: 'spin 0.7s linear infinite',
  },
};

// Inject keyframes for the spinner
const style = document.createElement('style');
style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(style);
