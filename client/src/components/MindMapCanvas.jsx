import React, { useMemo, useRef, useState, useEffect, useCallback, useReducer } from 'react';
import * as d3 from 'd3';
import { updateNode } from '../api.js';
import DescriptionEditor from './DescriptionEditor.jsx';
import LinksPanel from './LinksPanel.jsx';

// ─── Node dimensions by hop distance from active thought ─────────────────────
const HOP_STYLE = {
  0: { w: 200, h: 68,  fs: 15, fw: 700, fill: '#1B3F7B', text: '#ffffff', border: '#42B4E6', bw: 2.5 },
  1: { w: 158, h: 52,  fs: 12, fw: 600, fill: '#2C5282', text: '#ffffff', border: '#4A7DB5', bw: 1.5 },
  2: { w: 124, h: 42,  fs: 10, fw: 400, fill: '#1E293B', text: '#CBD5E0', border: '#334155', bw: 1   },
};

function hopStyle(hop) { return HOP_STYLE[Math.min(hop, 2)]; }
function collisionR(hop) {
  const s = hopStyle(hop);
  return Math.sqrt(s.w * s.w + s.h * s.h) / 2 + 10;
}
function linkDist(hopA, hopB) {
  const max = Math.max(hopA ?? 2, hopB ?? 2);
  return max <= 1 ? 280 : 200;
}

// ─── BFS: hop distances from activeId through all connections ─────────────────
function buildHopMap(activeId, adjMap, maxHops) {
  const dist = new Map();
  if (!activeId) return dist;
  dist.set(activeId, 0);
  const queue = [activeId];
  while (queue.length) {
    const cur = queue.shift();
    const d = dist.get(cur);
    if (d >= maxHops) continue;
    for (const nbr of (adjMap.get(cur) || [])) {
      if (!dist.has(nbr)) {
        dist.set(nbr, d + 1);
        queue.push(nbr);
      }
    }
  }
  return dist;
}

// ─── Text wrap (2 lines max for node labels) ──────────────────────────────────
function wrapText(text, maxW, fs) {
  const maxCh = Math.max(4, Math.floor(maxW / (fs * 0.58)));
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (test.length <= maxCh) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      if (lines.length >= 1) { cur = words.slice(words.indexOf(w)).join(' '); break; }
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 2);
}

// ─── Hover tooltip (HTML overlay) ────────────────────────────────────────────
function Tooltip({ node, pos }) {
  if (!node || !pos) return null;
  const typeColors = { idea: '#90CDF4', task: '#F6AD55', note: '#68D391', question: '#FC8181' };
  return (
    <div style={{
      position: 'absolute', left: pos.x + 16, top: pos.y - 12, zIndex: 100,
      background: '#0F172A', color: '#CBD5E0', borderRadius: 8, padding: '10px 14px',
      maxWidth: 280, pointerEvents: 'none',
      boxShadow: '0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(66,180,230,0.2)',
      fontFamily: "'Inter','Segoe UI',sans-serif", fontSize: 12, lineHeight: 1.5,
    }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 5 }}>{node.text}</div>
      {node.thought_type && (
        <div style={{ color: typeColors[node.thought_type] || '#90CDF4', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {node.thought_type}
        </div>
      )}
      {node.description && (
        <div style={{ color: '#94A3B8', marginBottom: 6 }}>{node.description}</div>
      )}
      {node.tags?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
          {node.tags.map(t => (
            <span key={t} style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 4, padding: '2px 7px', fontSize: 11, color: '#90CDF4' }}>{t}</span>
          ))}
        </div>
      )}
      {!node.thought_type && !node.description && !node.tags?.length && (
        <div style={{ color: '#475569', fontStyle: 'italic' }}>No additional details</div>
      )}
    </div>
  );
}

// ─── Edit panel ───────────────────────────────────────────────────────────────
function EditPanel({ node, token, mindmapId, allNodes, onSave, onClose, onNodeCreated, onNodeClick, onConnectionsChanged, onSaveStart, onSaveEnd }) {
  const [text, setText]           = useState(node.text);
  const [type, setType]           = useState(node.thought_type || 'idea');
  const [desc, setDesc]           = useState(node.description || '');
  const [tags, setTags]           = useState((node.tags || []).join(', '));
  const [saving, setSaving]       = useState(false);
  const [savedHint, setSavedHint] = useState(false);
  const [error, setError]         = useState(null);
  const autosaveTimer             = useRef(null);

  async function doSave(fields) {
    setSaving(true);
    onSaveStart?.();
    setError(null);
    try {
      const updated = await updateNode(token, node._id, fields);
      onSave(updated);
      setSavedHint(true);
      setTimeout(() => setSavedHint(false), 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
      onSaveEnd?.();
    }
  }

  function buildFields(overrides = {}) {
    return {
      text: (overrides.text ?? text).trim(),
      thought_type: overrides.type ?? type,
      description: (overrides.desc ?? desc).trim(),
      tags: (overrides.tags ?? tags).split(',').map(t => t.trim()).filter(Boolean),
    };
  }

  function scheduleAutosave(overrides = {}) {
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => doSave(buildFields(overrides)), 2000);
  }

  function handleBlurSave() {
    clearTimeout(autosaveTimer.current);
    doSave(buildFields());
  }

  useEffect(() => () => clearTimeout(autosaveTimer.current), []);

  const input = {
    width: '100%', boxSizing: 'border-box',
    background: '#1E293B', border: '1px solid #334155', borderRadius: 6,
    color: '#E2E8F0', fontSize: 13, padding: '8px 10px',
    fontFamily: 'inherit', outline: 'none',
  };
  const label = {
    display: 'block', color: '#64748B', fontSize: 11, fontWeight: 600,
    marginBottom: 5, marginTop: 14, textTransform: 'uppercase', letterSpacing: '0.06em',
  };

  return (
    <div style={{
      position: 'absolute', top: 0, right: 0, bottom: 0, width: 320,
      background: '#0F172A', borderLeft: '1px solid #1E293B',
      boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
      display: 'flex', flexDirection: 'column', zIndex: 50,
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#42B4E6', fontWeight: 700, fontSize: 14 }}>Edit Thought</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {savedHint && <span style={{ color: '#68D391', fontSize: 11 }}>Saved</span>}
          {saving    && <span style={{ color: '#64748B', fontSize: 11 }}>Saving…</span>}
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 20px' }}>
        <label style={label}>Title</label>
        <input
          value={text}
          onChange={e => { setText(e.target.value); scheduleAutosave({ text: e.target.value }); }}
          onBlur={handleBlurSave}
          style={input}
        />

        <label style={label}>Type</label>
        <select
          value={type}
          onChange={e => { setType(e.target.value); scheduleAutosave({ type: e.target.value }); }}
          onBlur={handleBlurSave}
          style={input}
        >
          {['idea', 'task', 'note', 'question'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <label style={label}>Description</label>
        <DescriptionEditor
          value={desc}
          onChange={v => { setDesc(v); scheduleAutosave({ desc: v }); }}
          nodes={allNodes}
          token={token}
          mindmapId={mindmapId}
          onNodeCreated={onNodeCreated}
        />

        <label style={label}>Tags (comma-separated)</label>
        <input
          value={tags}
          onChange={e => { setTags(e.target.value); scheduleAutosave({ tags: e.target.value }); }}
          onBlur={handleBlurSave}
          style={input}
          placeholder="strategy, priority, q1"
        />

        {error && <div style={{ color: '#FC8181', fontSize: 12, marginTop: 10 }}>{error}</div>}

        <div style={{ borderTop: '1px solid #1E293B', marginTop: 16, paddingTop: 12 }}>
          <LinksPanel
            nodeId={node._id}
            mindmapId={mindmapId}
            token={token}
            allNodes={allNodes}
            onNodeClick={(nodeId) => { onClose(); onNodeClick(nodeId); }}
            onConnectionsChanged={onConnectionsChanged}
          />
        </div>
      </div>

      <div style={{ padding: '14px 20px', borderTop: '1px solid #1E293B', display: 'flex', gap: 10 }}>
        <button onClick={() => { clearTimeout(autosaveTimer.current); doSave(buildFields()); }} disabled={saving} style={{
          flex: 1, background: '#2563EB', color: '#fff', border: 'none',
          borderRadius: 6, padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>{saving ? 'Saving…' : 'Save'}</button>
        <button onClick={onClose} style={{
          background: '#1E293B', color: '#94A3B8', border: '1px solid #334155',
          borderRadius: 6, padding: '9px 16px', fontSize: 13, cursor: 'pointer',
        }}>Close</button>
      </div>
    </div>
  );
}

// ─── Main canvas ──────────────────────────────────────────────────────────────
const MAX_HOPS = 2;

export default function MindMapCanvas({ nodes, connections, token, mindmapId, onNodeCreated, onSaveStart, onSaveEnd }) {
  const containerRef              = useRef(null);
  const [size, setSize]           = useState({ w: 0, h: 0 });
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [, tick]                  = useReducer(n => n + 1, 0);
  const [activeNodeId, setActiveNodeId]       = useState(null);
  const [hoveredNode, setHoveredNode]         = useState(null);
  const [tooltipPos, setTooltipPos]           = useState(null);
  const [editMode, setEditMode]               = useState(false);
  const [localNodes, setLocalNodes]           = useState(nodes);
  const [localConnections, setLocalConnections] = useState(connections);

  const simRef       = useRef(null);
  const posMap       = useRef({});
  const drag         = useRef(null);
  const initializedK = useRef(false);
  const transformRef = useRef({ x: 0, y: 0, k: 0.72 }); // sync copy for sync reads
  const sizeRef      = useRef({ w: 0, h: 0 });           // sync copy for clamp calc

  useEffect(() => { setLocalNodes(nodes); }, [nodes]);
  useEffect(() => { setLocalConnections(connections); }, [connections]);

  // Set root as initial active node
  useEffect(() => {
    if (!activeNodeId && nodes.length) {
      const root = nodes.find(n => n.level === 0) || nodes[0];
      setActiveNodeId(root._id);
    }
  }, [nodes, activeNodeId]);

  // Measure container
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      sizeRef.current = { w: width, h: height };
      setSize({ w: width, h: height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Adjacency map (undirected)
  const adjMap = useMemo(() => {
    const m = new Map();
    for (const c of localConnections) {
      if (!m.has(c.from_node_id)) m.set(c.from_node_id, new Set());
      if (!m.has(c.to_node_id))   m.set(c.to_node_id, new Set());
      m.get(c.from_node_id).add(c.to_node_id);
      m.get(c.to_node_id).add(c.from_node_id);
    }
    return m;
  }, [localConnections]);

  // BFS hop distances from active node
  const hopMap = useMemo(() =>
    buildHopMap(activeNodeId, adjMap, MAX_HOPS),
    [activeNodeId, adjMap]
  );

  const visibleNodes = useMemo(() =>
    localNodes.filter(n => hopMap.has(n._id)),
    [localNodes, hopMap]
  );

  const visibleConns = useMemo(() => {
    const vis = new Set(visibleNodes.map(n => n._id));
    return localConnections.filter(c => vis.has(c.from_node_id) && vis.has(c.to_node_id));
  }, [visibleNodes, localConnections]);

  // D3 force simulation — restarts whenever visible subgraph or active node changes
  useEffect(() => {
    if (!visibleNodes.length || !size.w || !size.h || !activeNodeId) return;
    if (simRef.current) simRef.current.stop();

    const cx = size.w / 2, cy = size.h / 2;

    // Build sim nodes; mark which ones need initial placement (no prior position)
    const simNodes = visibleNodes.map(n => {
      const hop  = hopMap.get(n._id) ?? 2;
      const prev = posMap.current[n._id];
      return {
        id: n._id, hop,
        x: prev?.x ?? (hop === 0 ? cx : null),
        y: prev?.y ?? (hop === 0 ? cy : null),
        vx: 0, vy: 0,
        fx: hop === 0 ? cx : undefined,
        fy: hop === 0 ? cy : undefined,
      };
    });

    // Structured angular seeding: evenly distribute hop-1 around center,
    // then place hop-2 nodes in the sector of their connected hop-1 parent.
    // This prevents the 90° empty-wedge that random placement produces.
    const hop1 = simNodes.filter(n => n.hop === 1);
    hop1.forEach((n, i) => {
      if (n.x !== null) return;
      const angle = (i / hop1.length) * Math.PI * 2 - Math.PI / 2;
      n.x = cx + 270 * Math.cos(angle);
      n.y = cy + 270 * Math.sin(angle);
    });

    const hop2 = simNodes.filter(n => n.hop === 2);
    hop2.forEach(n2 => {
      if (n2.x !== null) return;
      const parent = hop1.find(h1 => adjMap.get(h1.id)?.has(n2.id));
      if (parent) {
        const parentAngle = Math.atan2(parent.y - cy, parent.x - cx);
        const spread = (Math.random() - 0.5) * (Math.PI * 0.5);
        n2.x = parent.x + 210 * Math.cos(parentAngle + spread);
        n2.y = parent.y + 210 * Math.sin(parentAngle + spread);
      } else {
        const a = Math.random() * Math.PI * 2;
        n2.x = cx + 460 * Math.cos(a);
        n2.y = cy + 460 * Math.sin(a);
      }
    });

    const byId = new Map(simNodes.map(n => [n.id, n]));
    const simLinks = visibleConns.map(c => ({
      source: c.from_node_id,
      target: c.to_node_id,
      distance: linkDist(byId.get(c.from_node_id)?.hop, byId.get(c.to_node_id)?.hop),
    }));

    const sim = d3.forceSimulation(simNodes)
      .force('link',
        d3.forceLink(simLinks).id(d => d.id).distance(d => d.distance).strength(0.65))
      .force('charge',
        d3.forceManyBody().strength(d => [-2200, -900, -350][Math.min(d.hop, 2)]))
      .force('collide',
        d3.forceCollide().radius(d => collisionR(d.hop)).strength(1).iterations(3))
      .alphaDecay(0.022)
      .on('tick', () => {
        for (const n of simNodes) posMap.current[n.id] = { x: n.x, y: n.y };
        tick();
      });

    simRef.current = sim;
    return () => sim.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleNodes, visibleConns, size.w, size.h, activeNodeId, adjMap]);

  // Center active node in viewport; preserve zoom level after first load
  useEffect(() => {
    if (!size.w || !size.h || !activeNodeId) return;
    setTransform(t => {
      const k = initializedK.current ? t.k : 0.72;
      initializedK.current = true;
      return {
        x: size.w / 2 * (1 - k),
        y: size.h / 2 * (1 - k),
        k,
      };
    });
  }, [activeNodeId, size.w, size.h]);

  // Keep transformRef in sync so onMouseDown can read it synchronously
  useEffect(() => { transformRef.current = transform; }, [transform]);

  // Pan: read transform from ref synchronously so drag.current is always set before onMove fires.
  // Bind move/up to window so fast drags don't lose events when mouse leaves the div.
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    const t = transformRef.current;
    drag.current = { sx: e.clientX, sy: e.clientY, ox: t.x, oy: t.y };
  }, []);

  useEffect(() => {
    function onMove(e) {
      if (!drag.current) return;
      const { w, h } = sizeRef.current;
      const k = transformRef.current.k;
      const rawX = drag.current.ox + (e.clientX - drag.current.sx);
      const rawY = drag.current.oy + (e.clientY - drag.current.sy);
      // Clamp so the active node (sim center) stays at least 15% inside the viewport
      const margin = 0.15;
      const minX = w * margin - (w / 2) * k;
      const maxX = w * (1 - margin) - (w / 2) * k;
      const minY = h * margin - (h / 2) * k;
      const maxY = h * (1 - margin) - (h / 2) * k;
      setTransform(t => ({
        ...t,
        x: Math.min(maxX, Math.max(minX, rawX)),
        y: Math.min(maxY, Math.max(minY, rawY)),
      }));
    }
    function onUp() { drag.current = null; }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // Zoom: always pivot on the active node (sim center = size.w/2, size.h/2)
  // so active node stays fixed on screen regardless of current pan offset.
  const onWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    setTransform(t => {
      const newK = Math.min(3, Math.max(0.15, t.k * factor));
      // Active node screen position = t.x + (size.w/2)*t.k
      const pivotX = t.x + (size.w / 2) * t.k;
      const pivotY = t.y + (size.h / 2) * t.k;
      return {
        x: pivotX - (size.w / 2) * newK,
        y: pivotY - (size.h / 2) * newK,
        k: newK,
      };
    });
  }, [size.w, size.h]);

  function handleNodeClick(e, node) {
    e.stopPropagation();
    if (node._id === activeNodeId) {
      setEditMode(true);
    } else {
      // Clear all positions so the new subgraph seeds from structured angular layout
      posMap.current = {};
      setActiveNodeId(node._id);
      setEditMode(false);
      setHoveredNode(null);
    }
  }

  function handleNodeSave(updated) {
    setLocalNodes(prev => prev.map(n => n._id === updated._id ? { ...n, ...updated } : n));
  }

  async function refreshConnections() {
    if (!mindmapId || !token) return;
    try {
      const res = await fetch(`/api/connections/${mindmapId}`, { headers: { 'x-auth-token': token } });
      if (res.ok) setLocalConnections(await res.json());
    } catch { /* silent */ }
  }

  function handleNodeCreatedInPanel(newNode) {
    setLocalNodes(prev => [...prev, newNode]);
    if (onNodeCreated) onNodeCreated(newNode);
  }

  // Build render list from current posMap (re-evaluated on every tick-triggered render)
  const renderNodes = visibleNodes
    .map(n => ({
      ...n,
      hop: hopMap.get(n._id) ?? 2,
      x: posMap.current[n._id]?.x ?? size.w / 2,
      y: posMap.current[n._id]?.y ?? size.h / 2,
    }))
    .sort((a, b) => b.hop - a.hop); // higher hop renders first (behind)

  const renderPosMap = {};
  for (const n of renderNodes) renderPosMap[n._id] = { x: n.x, y: n.y };

  const activeNode = localNodes.find(n => n._id === activeNodeId);

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0F172A' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', cursor: drag.current ? 'grabbing' : 'grab' }}
        onMouseDown={onMouseDown}
      >
        <svg width="100%" height="100%" style={{ display: 'block' }} onWheel={onWheel}>
          <defs>
            <filter id="activeglow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="14" floodColor="#42B4E6" floodOpacity="0.45" />
            </filter>
          </defs>

          <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>

            {/* Links */}
            {visibleConns.map(c => {
              const from = renderPosMap[c.from_node_id];
              const to   = renderPosMap[c.to_node_id];
              if (!from || !to) return null;
              const hopA = hopMap.get(c.from_node_id) ?? 2;
              const hopB = hopMap.get(c.to_node_id)   ?? 2;
              const minH = Math.min(hopA, hopB);
              const stroke  = minH === 0 ? '#42B4E6' : minH === 1 ? '#4A7DB5' : '#334155';
              const opacity = minH === 0 ? 0.8        : minH === 1 ? 0.5        : 0.3;
              const sw      = minH === 0 ? 2          : minH === 1 ? 1.5        : 1;
              return (
                <line key={c._id}
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={stroke} strokeWidth={sw} opacity={opacity}
                />
              );
            })}

            {/* Nodes */}
            {renderNodes.map(n => {
              const s        = hopStyle(n.hop);
              const isActive = n._id === activeNodeId;
              const textLines = wrapText(n.text, s.w - 28, s.fs);
              const tagLine   = isActive && n.tags?.length
                ? n.tags.slice(0, 4).join(' · ')
                : null;

              const lineH      = s.fs * 1.35;
              const tagLineH   = s.fs * 1.1;
              const totalH     = textLines.length * lineH + (tagLine ? tagLineH : 0);
              const textStartY = -totalH / 2 + lineH * 0.72;

              return (
                <g
                  key={n._id}
                  transform={`translate(${n.x},${n.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={e => handleNodeClick(e, n)}
                  onMouseDown={e => e.stopPropagation()}
                  onMouseEnter={e => {
                    setHoveredNode(n);
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseMove={e => setTooltipPos({ x: e.clientX, y: e.clientY })}
                  onMouseLeave={() => { setHoveredNode(null); setTooltipPos(null); }}
                >
                  <rect
                    x={-s.w / 2} y={-s.h / 2} width={s.w} height={s.h}
                    rx={8} ry={8}
                    fill={s.fill} stroke={s.border} strokeWidth={s.bw}
                    filter={isActive ? 'url(#activeglow)' : undefined}
                  />
                  {textLines.map((line, i) => (
                    <text key={i}
                      x={0} y={textStartY + i * lineH}
                      textAnchor="middle"
                      fill={s.text} fontSize={s.fs} fontWeight={s.fw}
                      fontFamily="'Inter','Segoe UI',sans-serif"
                      style={{ userSelect: 'none', pointerEvents: 'none' }}
                    >{line}</text>
                  ))}
                  {tagLine && (
                    <text
                      x={0} y={textStartY + textLines.length * lineH}
                      textAnchor="middle"
                      fill="#90CDF4" fontSize={s.fs * 0.75} fontWeight={400}
                      fontFamily="'Inter','Segoe UI',sans-serif"
                      style={{ userSelect: 'none', pointerEvents: 'none' }}
                    >{tagLine}</text>
                  )}
                </g>
              );
            })}

          </g>
        </svg>
      </div>

      <Tooltip node={hoveredNode} pos={tooltipPos} />

      {editMode && activeNode && (
        <EditPanel
          node={activeNode}
          token={token}
          mindmapId={mindmapId}
          allNodes={localNodes}
          onSave={handleNodeSave}
          onClose={() => setEditMode(false)}
          onNodeCreated={handleNodeCreatedInPanel}
          onNodeClick={(nodeId) => {
            posMap.current = {};
            setActiveNodeId(nodeId);
            setEditMode(false);
          }}
          onConnectionsChanged={refreshConnections}
          onSaveStart={onSaveStart}
          onSaveEnd={onSaveEnd}
        />
      )}

      {/* Hint */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16,
        color: '#334155', fontSize: 11, fontFamily: "'Inter','Segoe UI',sans-serif",
        userSelect: 'none', pointerEvents: 'none',
      }}>
        Click any thought to focus · Click active thought to edit · Scroll to zoom · Drag to pan
      </div>
    </div>
  );
}
