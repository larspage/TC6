import React from 'react';

/**
 * Renders description text with [[NodeTitle]] wiki links as clickable chips.
 * Stolen and adapted from Notetaker's PreviewContent component.
 *
 * Props:
 *   content    — raw description string
 *   nodes      — allNodes array (for title → _id resolution)
 *   onNodeClick — called with node._id when a link is clicked
 */
export default function DescriptionPreview({ content, nodes, onNodeClick }) {
  if (!content?.trim()) return null;

  const parts = [];
  let lastIndex = 0;
  const regex = /\[\[([^\]]+)\]\]/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`t-${lastIndex}`}>{content.slice(lastIndex, match.index)}</span>
      );
    }

    const linkText = match[1];
    const targetNode = nodes?.find(
      n => n.text.toLowerCase() === linkText.toLowerCase()
    );

    parts.push(
      <span
        key={`l-${match.index}`}
        onClick={() => targetNode && onNodeClick?.(targetNode._id)}
        title={targetNode ? `Go to: ${linkText}` : `Node not found: ${linkText}`}
        style={{
          color: targetNode ? '#90CDF4' : '#64748B',
          background: targetNode ? '#1E3A5F' : '#1E293B',
          borderRadius: 3,
          padding: '0 4px',
          cursor: targetNode ? 'pointer' : 'default',
          fontWeight: 500,
          textDecoration: targetNode ? 'none' : 'line-through',
        }}
      >
        {linkText}
      </span>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(<span key={`t-${lastIndex}`}>{content.slice(lastIndex)}</span>);
  }

  return (
    <div style={{
      whiteSpace: 'pre-wrap',
      lineHeight: 1.6,
      fontSize: 12,
      color: '#94A3B8',
      padding: '8px 10px',
      background: '#0F172A',
      borderRadius: 6,
      border: '1px solid #1E293B',
      marginTop: 6,
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      {parts}
    </div>
  );
}
