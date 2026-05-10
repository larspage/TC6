import React, { useState, useRef } from 'react';
import MentionAutocomplete from './MentionAutocomplete';
import DescriptionPreview from './DescriptionPreview';

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

/**
 * Description editor with @mention autocomplete and [[link]] preview.
 *
 * Props:
 *   value, onChange         — controlled text value
 *   nodes                   — allNodes array for mention search + link resolution
 *   token, mindmapId, nodeId — TC6 auth/context for creating nodes + connections
 *   onNodeCreated           — called with new node object after @-create
 *   onConnectionsChanged    — called after mention connection is created
 *   onNodeClick             — called with node._id when a [[link]] chip is clicked
 */
export default function DescriptionEditor({
  value,
  onChange,
  nodes,
  token,
  mindmapId,
  nodeId,
  onNodeCreated,
  onConnectionsChanged,
  onNodeClick,
}) {
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionPos, setMentionPos] = useState(null);
  const [mentionStart, setMentionStart] = useState(null);
  const textareaRef = useRef(null);

  const hasLinks = value && /\[\[/.test(value);

  const handleChange = (e) => {
    const text = e.target.value;
    onChange(text);
    detectMention(text, e.target);
  };

  const detectMention = (text, textarea) => {
    const cursor = textarea.selectionStart;

    // Scan backwards from cursor to find last @ (stop at newline or start)
    // Spaces are allowed in mention queries (e.g. @My Friends)
    let atIndex = -1;
    for (let i = cursor - 1; i >= 0; i--) {
      if (text[i] === '\n') break;
      if (text[i] === '@') {
        atIndex = i;
        break;
      }
    }

    if (atIndex === -1) {
      setMentionQuery(null);
      return;
    }

    // Check if there's a ]] after the @ (already resolved)
    const afterAt = text.slice(atIndex, cursor);
    if (afterAt.includes(']]')) {
      setMentionQuery(null);
      return;
    }

    const query = text.slice(atIndex + 1, cursor);
    const rect = textarea.getBoundingClientRect();

    setMentionQuery(query);
    setMentionStart(atIndex);
    setMentionPos({
      top: rect.bottom - 40,
      left: rect.left + 8,
    });
  };

  const handleSelect = (node) => {
    const textarea = textareaRef.current;
    const cursor = textarea.selectionStart;
    const before = value.slice(0, mentionStart);
    const after = value.slice(cursor);
    const inserted = `[[${node.title}]]`;
    const newValue = before + inserted + after;
    onChange(newValue);
    setMentionQuery(null);
    setMentionPos(null);
    setMentionStart(null);
    setTimeout(() => {
      if (textareaRef.current) {
        const pos = mentionStart + inserted.length;
        textareaRef.current.selectionStart = pos;
        textareaRef.current.selectionEnd = pos;
        textareaRef.current.focus();
      }
    }, 0);
  };

  const handleCreate = async (query) => {
    const capturedMentionStart = mentionStart;
    setMentionQuery(null);
    setMentionPos(null);
    setMentionStart(null);
    try {
      const headers = { 'Content-Type': 'application/json', 'x-auth-token': token };

      const nodeRes = await fetch('/api/nodes', {
        method: 'POST',
        headers,
        body: JSON.stringify({ mindmap_id: mindmapId, text: query, position: { x: 0, y: 0 } }),
      });
      if (!nodeRes.ok) return;
      const newNode = await nodeRes.json();

      if (nodeId) {
        await fetch('/api/connections', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            mindmap_id: mindmapId,
            from_node_id: nodeId,
            to_node_id: newNode._id,
            connection_type: 'mention',
          }),
        });
        onConnectionsChanged?.();
      }

      const textarea = textareaRef.current;
      const cursor = textarea ? textarea.selectionStart : value.length;
      const before = value.slice(0, capturedMentionStart ?? cursor);
      const after = value.slice(cursor);
      const inserted = `[[${newNode.text}]]`;
      onChange(before + inserted + after);
      onNodeCreated?.(newNode);
    } catch {
      // silent fail
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        rows={4}
        style={{
          ...inputStyle,
          resize: 'vertical',
          width: '100%',
          boxSizing: 'border-box',
        }}
        placeholder="Describe this thought… type @ to link to another node"
      />
      {hasLinks && (
        <DescriptionPreview
          content={value}
          nodes={nodes}
          onNodeClick={onNodeClick}
        />
      )}
      {mentionQuery !== null && mentionPos && (
        <MentionAutocomplete
          query={mentionQuery}
          nodes={nodes}
          position={mentionPos}
          onSelect={handleSelect}
          onCreate={handleCreate}
          onDismiss={() => setMentionQuery(null)}
        />
      )}
    </div>
  );
}
