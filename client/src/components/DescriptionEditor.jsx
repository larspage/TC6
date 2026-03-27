import React, { useState, useRef } from 'react';
import MentionAutocomplete from './MentionAutocomplete';

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

export default function DescriptionEditor({ value, onChange, nodes, token, mindmapId, onNodeCreated }) {
  const [mentionQuery, setMentionQuery] = useState(null);
  const [mentionPos, setMentionPos] = useState(null);
  const [mentionStart, setMentionStart] = useState(null);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const text = e.target.value;
    onChange(text);
    detectMention(text, e.target);
  };

  const detectMention = (text, textarea) => {
    const cursor = textarea.selectionStart;

    // Scan backwards from cursor to find last @ (stop at newline or start)
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
    const inserted = `[[${node.text}]]`;
    const newValue = before + inserted + after;
    onChange(newValue);
    setMentionQuery(null);
    setMentionPos(null);
    setMentionStart(null);
    // Restore cursor after insertion
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
    setMentionQuery(null);
    setMentionPos(null);
    setMentionStart(null);
    try {
      const res = await fetch('/api/nodes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          mindmap_id: mindmapId,
          text: query,
          position: { x: 0, y: 0 },
        }),
      });
      if (!res.ok) return;
      const newNode = await res.json();
      const textarea = textareaRef.current;
      const cursor = textarea ? textarea.selectionStart : value.length;
      const before = value.slice(0, mentionStart ?? cursor);
      const after = value.slice(cursor);
      const inserted = `[[${newNode.text}]]`;
      const newValue = before + inserted + after;
      onChange(newValue);
      if (onNodeCreated) onNodeCreated(newNode);
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
