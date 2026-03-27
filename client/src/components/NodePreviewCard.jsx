import React from 'react';

const typeColors = { idea: '#90CDF4', task: '#F6AD55', note: '#68D391', question: '#FC8181' };

export default function NodePreviewCard({ node, position, onClick }) {
  if (!node || !position) return null;

  const typeColor = typeColors[node.thought_type] || '#90CDF4';
  const desc = node.description
    ? node.description.length > 120
      ? node.description.slice(0, 120) + '…'
      : node.description
    : null;

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: position.x + 14,
        top: position.y - 8,
        zIndex: 300,
        pointerEvents: 'auto',
        background: '#0F172A',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '10px 14px',
        maxWidth: 280,
        boxShadow: '0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(66,180,230,0.2)',
        fontFamily: "'Inter','Segoe UI',sans-serif",
        fontSize: 12,
        lineHeight: 1.5,
        cursor: 'pointer',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 5 }}>
        {node.text}
      </div>
      {node.thought_type && (
        <div style={{
          color: typeColor,
          fontSize: 11,
          marginBottom: desc ? 4 : 0,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {node.thought_type}
        </div>
      )}
      {desc && (
        <div style={{ color: '#94A3B8', fontSize: 12, marginBottom: 6 }}>
          {desc}
        </div>
      )}
      <div style={{ color: '#475569', fontSize: 11, fontStyle: 'italic' }}>
        Click to navigate →
      </div>
    </div>
  );
}
