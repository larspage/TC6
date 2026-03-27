import React, { useState, useEffect } from 'react';

const typeColors = { idea: '#90CDF4', task: '#F6AD55', note: '#68D391', question: '#FC8181' };

export default function MentionAutocomplete({ query, nodes, position, onSelect, onCreate, onDismiss }) {
  const [highlighted, setHighlighted] = useState(0);

  const matches = query.length > 0
    ? nodes.filter(n => n.text.toLowerCase().includes(query.toLowerCase()))
    : [];

  // Build items before hooks so effects can use it — but ALL hooks must be called unconditionally
  const tooMany = matches.length > 10;
  const items = tooMany
    ? null
    : matches.length > 0
      ? matches.map(n => ({ type: 'node', node: n }))
      : query.length > 0
        ? [{ type: 'create', label: query }]
        : null;

  // ── Hooks must all be called before any early return ──────────────────────
  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  useEffect(() => {
    if (!items || items.length === 0) return;
    const onKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlighted(h => Math.min(h + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlighted(h => Math.max(h - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const safe = Math.min(highlighted, items.length - 1);
        const item = items[safe];
        if (item) {
          if (item.type === 'node') onSelect(item.node);
          else if (item.type === 'create') onCreate(item.label);
        }
      } else if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [items, highlighted, onDismiss, onSelect, onCreate]);
  // ── Early returns after all hooks ─────────────────────────────────────────

  if (!items || items.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        maxWidth: 260,
        zIndex: 200,
        fontFamily: "'Inter','Segoe UI',sans-serif",
        overflow: 'hidden',
      }}
    >
      {items.map((item, i) => {
        const isHighlighted = i === highlighted;
        if (item.type === 'create') {
          return (
            <div
              key="create"
              onMouseDown={(e) => { e.preventDefault(); onCreate(item.label); }}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                padding: '8px 12px',
                fontSize: 13,
                color: '#90CDF4',
                fontStyle: 'italic',
                cursor: 'pointer',
                background: isHighlighted ? '#1E3A5F' : 'transparent',
              }}
            >
              ✦ Create: {item.label}
            </div>
          );
        }
        const typeColor = typeColors[item.node.thought_type] || '#90CDF4';
        return (
          <div
            key={item.node._id}
            onMouseDown={(e) => { e.preventDefault(); onSelect(item.node); }}
            onMouseEnter={() => setHighlighted(i)}
            style={{
              padding: '8px 12px',
              fontSize: 13,
              color: '#E2E8F0',
              cursor: 'pointer',
              background: isHighlighted ? '#1E3A5F' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: typeColor, flexShrink: 0,
            }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.node.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
