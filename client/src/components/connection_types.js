// ─── Connection Type Definitions ────────────────────────────────────────────
// Each type has: label, category, color (for edge rendering), dash/dot style
// Categories match the optgroups in the LinksPanel type picker.

export const CONNECTION_CATEGORIES = {
  structure: 'Structure',
  causality: 'Causality & Logic',
  sequence:  'Sequence & Dependency',
  semantic:  'Semantic',
  meta:      'Meta',
};

export const CONNECTION_TYPES = [
  // ── Structure ──────────────────────────────────────────────────────────────
  {
    key: 'parent-child',
    label: 'Parent / Child',
    category: 'structure',
    color: '#60A5FA',
    style: 'solid',
    direction: 'directed',
    description: 'Tree hierarchy — parent contains or owns child',
  },
  {
    key: 'related',
    label: 'Related',
    category: 'structure',
    color: '#94A3B8',
    style: 'solid',
    direction: 'undirected',
    description: 'General association (default link type)',
  },
  {
    key: 'part_of',
    label: 'Part Of',
    category: 'structure',
    color: '#818CF8',
    style: 'solid',
    direction: 'directed',
    description: 'Component or subset of another thought',
  },

  // ── Causality & Logic ──────────────────────────────────────────────────────
  {
    key: 'causes',
    label: 'Causes',
    category: 'causality',
    color: '#F87171',
    style: 'solid',
    direction: 'directed',
    description: 'A leads to / produces B',
  },
  {
    key: 'supports',
    label: 'Supports',
    category: 'causality',
    color: '#34D399',
    style: 'solid',
    direction: 'directed',
    description: 'A agrees with B / is evidence for B',
  },
  {
    key: 'contradicts',
    label: 'Contradicts',
    category: 'causality',
    color: '#FB923C',
    style: 'dashed',
    direction: 'directed',
    description: 'A disagrees with B / opposes B',
  },
  {
    key: 'questions',
    label: 'Questions',
    category: 'causality',
    color: '#FBBF24',
    style: 'dotted',
    direction: 'directed',
    description: 'A raises a question about B',
  },

  // ── Sequence & Dependency ──────────────────────────────────────────────────
  {
    key: 'precedes',
    label: 'Precedes',
    category: 'sequence',
    color: '#67E8F9',
    style: 'solid',
    direction: 'directed',
    description: 'A comes before B (temporal or logical order)',
  },
  {
    key: 'depends_on',
    label: 'Depends On',
    category: 'sequence',
    color: '#F472B6',
    style: 'solid',
    direction: 'directed',
    description: 'A requires B as a prerequisite',
  },
  {
    key: 'blocks',
    label: 'Blocks',
    category: 'sequence',
    color: '#E11D48',
    style: 'dashed',
    direction: 'directed',
    description: 'A is blocked by B (task dependency)',
  },

  // ── Semantic ───────────────────────────────────────────────────────────────
  {
    key: 'similar',
    label: 'Similar',
    category: 'semantic',
    color: '#A78BFA',
    style: 'solid',
    direction: 'undirected',
    description: 'A is analogous or alike to B',
  },
  {
    key: 'opposite',
    label: 'Opposite',
    category: 'semantic',
    color: '#E879F9',
    style: 'dashed',
    direction: 'undirected',
    description: 'A is the inverse or opposite of B',
  },
  {
    key: 'expands_on',
    label: 'Expands On',
    category: 'semantic',
    color: '#2DD4BF',
    style: 'solid',
    direction: 'directed',
    description: 'A elaborates / goes deeper on B',
  },
  {
    key: 'references',
    label: 'References',
    category: 'semantic',
    color: '#38BDF8',
    style: 'dotted',
    direction: 'directed',
    description: 'A cites or refers to B',
  },

  // ── Meta ───────────────────────────────────────────────────────────────────
  {
    key: 'duplicate',
    label: 'Duplicate',
    category: 'meta',
    color: '#FBBF24',
    style: 'dotted',
    direction: 'undirected',
    description: 'A is a duplicate of B (dedup marker)',
  },
  {
    key: 'mention',
    label: 'Mention',
    category: 'meta',
    color: '#64748B',
    style: 'dotted',
    direction: 'directed',
    description: 'Auto-created from [[wiki-link]] or @mention',
  },
];

// ─── Lookup helpers ─────────────────────────────────────────────────────────

export function getTypeDef(key) {
  return CONNECTION_TYPES.find(t => t.key === key) || CONNECTION_TYPES[1]; // fallback to 'related'
}

export function groupTypesByCategory() {
  const groups = {};
  for (const t of CONNECTION_TYPES) {
    if (!groups[t.category]) groups[t.category] = [];
    groups[t.category].push(t);
  }
  return groups;
}
