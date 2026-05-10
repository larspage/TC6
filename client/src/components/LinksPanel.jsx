import React, { useState, useEffect } from 'react';
import NodePreviewCard from './NodePreviewCard';
import { CONNECTION_TYPES, getTypeDef, groupTypesByCategory } from './connection_types';

const labelStyle = {
  color: '#64748B',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

const inputStyle = {
  background: '#1E293B',
  border: '1px solid #334155',
  borderRadius: 6,
  color: '#E2E8F0',
  fontSize: 13,
  padding: '8px 10px',
  fontFamily: "'Inter','Segoe UI',sans-serif",
  outline: 'none',
};

const selectStyle = {
  ...inputStyle,
  fontSize: 11,
  padding: '5px 8px',
  cursor: 'pointer',
};

const divider = {
  borderTop: '1px solid #1E293B',
  margin: '8px 0',
};

function TypeDot({ color, size = 8 }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      flexShrink: 0,
    }} />
  );
}

function NodeChip({ label, onClick, onDelete, onMouseEnter, onMouseLeave, typeKey, showTypePicker }) {
  const td = getTypeDef(typeKey);
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: '#1E293B',
        border: '1px solid #334155',
        borderRadius: 6,
        padding: '4px 8px',
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <TypeDot color={td.color} />
      <span
        onClick={onClick}
        style={{
          maxWidth: 80,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: 11,
          color: '#CBD5E0',
          display: 'block',
        }}
        title={label}
      >
        {label}
      </span>
      {showTypePicker && (
        <span
          onClick={(e) => { e.stopPropagation(); setShowMenu(s => !s); }}
          style={{
            fontSize: 9,
            color: td.color,
            cursor: 'pointer',
            padding: '0 2px',
            whiteSpace: 'nowrap',
          }}
          title={td.description}
        >
          {td.label}
        </span>
      )}
      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            fontSize: 11,
            padding: 0,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
          }}
          title="Remove link"
        >
          ✕
        </button>
      )}
      {showMenu && showTypePicker && (
        <TypeMenu
          onSelect={(key) => { showTypePicker(key); setShowMenu(false); }}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

function TypeMenu({ onSelect, onClose }) {
  const groups = groupTypesByCategory();
  const CATEGORY_LABELS = {
    structure: 'Structure',
    causality: 'Causality & Logic',
    sequence: 'Sequence & Dependency',
    semantic: 'Semantic',
    meta: 'Meta',
  };
  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 999 }}
        onClick={onClose}
      />
      <div style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        zIndex: 1000,
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: 6,
        minWidth: 180,
        padding: '4px 0',
        marginTop: 2,
      }}>
        {Object.entries(groups).map(([cat, types]) => (
          <div key={cat}>
            <div style={{
              fontSize: 9,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#64748B',
              padding: '6px 10px 2px',
            }}>
              {CATEGORY_LABELS[cat] || cat}
            </div>
            {types.map(t => (
              <div
                key={t.key}
                onClick={() => onSelect(t.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  fontSize: 11,
                  color: '#E2E8F0',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1E3A5F'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                title={t.description}
              >
                <TypeDot color={t.color} size={6} />
                {t.label}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default function LinksPanel({ nodeId, mindmapId, token, allNodes, onNodeClick, onConnectionsChanged }) {
  const [inbound, setInbound] = useState([]);
  const [outbound, setOutbound] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState('');
  const [selectedType, setSelectedType] = useState('related');
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [hoverPos, setHoverPos] = useState(null);

  useEffect(() => {
    if (!nodeId) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/connections/node/${nodeId}`, {
      headers: { 'x-auth-token': token },
    })
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        setInbound(data.inbound || []);
        setOutbound(data.outbound || []);
      })
      .catch(() => {
        if (!cancelled) { setInbound([]); setOutbound([]); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [nodeId, token, refreshKey]);

  const resolveNode = (id) => allNodes.find(n => n._id === id) || null;

  const handleDelete = async (connectionId) => {
    try {
      await fetch(`/api/connections/${connectionId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token },
      });
      setRefreshKey(k => k + 1);
      onConnectionsChanged();
    } catch {
      // silent fail
    }
  };

  const outboundNodeIds = new Set(outbound.map(c => c.to_node_id));

  const pickerResults = pickerQuery.length > 0
    ? allNodes
        .filter(n =>
          n._id !== nodeId &&
          !outboundNodeIds.has(n._id) &&
          n.title.toLowerCase().includes(pickerQuery.toLowerCase())
        )
        .slice(0, 10)
    : [];

  const handleTypeChange = async (connectionId, newType) => {
    try {
      await fetch(`/api/connections/${connectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ connection_type: newType }),
      });
      setRefreshKey(k => k + 1);
      onConnectionsChanged();
    } catch {
      // silent fail
    }
  };

  const handleAddLink = async (targetNode) => {
    try {
      await fetch('/api/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          mindmap_id: mindmapId,
          from_node_id: nodeId,
          to_node_id: targetNode._id,
          connection_type: selectedType,
        }),
      });
      setPickerOpen(false);
      setPickerQuery('');
      setRefreshKey(k => k + 1);
      onConnectionsChanged();
    } catch {
      // silent fail
    }
  };

  const hoveredNode = hoveredNodeId ? resolveNode(hoveredNodeId) : null;

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* Section header */}
      <div style={{ ...labelStyle, marginBottom: 8 }}>Linked Nodes</div>
      <div style={divider} />

      {/* Backlinks */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ ...labelStyle, marginBottom: 6 }}>
          Backlinks ({inbound.length})
        </div>
        {loading ? (
          <div style={{ color: '#64748B', fontSize: 11 }}>Loading…</div>
        ) : inbound.length === 0 ? (
          <div style={{ color: '#475569', fontSize: 11 }}>No backlinks</div>
        ) : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            maxHeight: 100,
            overflowY: 'auto',
          }}>
            {inbound.map(conn => {
              const node = resolveNode(conn.from_node_id);
              if (!node) return null;
              return (
                <NodeChip
                  key={conn._id}
                  label={node.title}
                  typeKey={conn.connection_type}
                  onClick={() => onNodeClick(node._id)}
                  onMouseEnter={(e) => {
                    setHoveredNodeId(node._id);
                    setHoverPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => { setHoveredNodeId(null); setHoverPos(null); }}
                />
              );
            })}
          </div>
        )}
      </div>

      <div style={divider} />

      {/* Outbound links */}
      <div style={{ marginBottom: 8 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}>
          <div style={labelStyle}>Outbound Links ({outbound.length})</div>
          <button
            onClick={() => { setPickerOpen(p => !p); setPickerQuery(''); }}
            style={{
              background: pickerOpen ? '#1E3A5F' : '#1E293B',
              border: '1px solid #334155',
              borderRadius: 4,
              color: '#42B4E6',
              fontSize: 11,
              padding: '3px 8px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            + Add
          </button>
        </div>

        {loading ? (
          <div style={{ color: '#64748B', fontSize: 11 }}>Loading…</div>
        ) : outbound.length === 0 && !pickerOpen ? (
          <div style={{ color: '#475569', fontSize: 11 }}>No outbound links</div>
        ) : (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            maxHeight: 100,
            overflowY: 'auto',
            marginBottom: pickerOpen ? 8 : 0,
          }}>
            {outbound.map(conn => {
              const node = resolveNode(conn.to_node_id);
              if (!node) return null;
              return (
                <NodeChip
                  key={conn._id}
                  label={node.title}
                  typeKey={conn.connection_type}
                  onClick={() => onNodeClick(node._id)}
                  onDelete={() => handleDelete(conn._id)}
                  showTypePicker={(newType) => handleTypeChange(conn._id, newType)}
                  onMouseEnter={(e) => {
                    setHoveredNodeId(node._id);
                    setHoverPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => { setHoveredNodeId(null); setHoverPos(null); }}
                />
              );
            })}
          </div>
        )}

        {pickerOpen && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                style={{ ...selectStyle, flex: '0 0 auto', maxWidth: 130 }}
              >
                {Object.entries(groupTypesByCategory()).map(([cat, types]) => (
                  <optgroup key={cat} label={{
                    structure: 'Structure',
                    causality: 'Causality & Logic',
                    sequence: 'Sequence & Dependency',
                    semantic: 'Semantic',
                    meta: 'Meta',
                  }[cat] || cat}>
                    {types.map(t => (
                      <option key={t.key} value={t.key}>{t.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <input
                autoFocus
                value={pickerQuery}
                onChange={e => setPickerQuery(e.target.value)}
                placeholder="Search nodes…"
                style={{ ...inputStyle, flex: 1, minWidth: 0 }}
              />
            </div>
            {pickerResults.length > 0 && (
              <div style={{
                background: '#0F172A',
                border: '1px solid #334155',
                borderRadius: 6,
                overflow: 'hidden',
              }}>
                {pickerResults.map(node => (
                  <div
                    key={node._id}
                    onClick={() => handleAddLink(node)}
                    style={{
                      padding: '7px 10px',
                      fontSize: 12,
                      color: '#E2E8F0',
                      cursor: 'pointer',
                      borderBottom: '1px solid #1E293B',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#1E3A5F'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    {node.title}
                  </div>
                ))}
              </div>
            )}
            {pickerQuery.length > 0 && pickerResults.length === 0 && (
              <div style={{ color: '#475569', fontSize: 11, padding: '4px 2px' }}>
                No matching nodes
              </div>
            )}
          </div>
        )}
      </div>

      {/* NodePreviewCard hover overlay */}
      {hoveredNode && hoverPos && (
        <NodePreviewCard
          node={hoveredNode}
          position={hoverPos}
          onClick={() => { onNodeClick(hoveredNode._id); setHoveredNodeId(null); }}
        />
      )}
    </div>
  );
}
