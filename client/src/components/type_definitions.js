// ─── Base schemas ─────────────────────────────────────────────────────────────
// Backend key → display label mapping per base type.
// Concrete types inherit these fields and can override labels/options.

export const TYPE_BASES = {
  creative_work: {
    fields: [
      { key: 'creator', label: 'Creator',  inputType: 'text'   },
      { key: 'year',    label: 'Year',     inputType: 'number' },
      { key: 'genre',   label: 'Genre',    inputType: 'text'   },
      { key: 'rating',  label: 'Rating',   inputType: 'rating' },
      { key: 'status',  label: 'Status',   inputType: 'select',
        options: ['', 'Want', 'In Progress', 'Done'] },
    ],
  },
  event: {
    fields: [
      { key: 'date',         label: 'Date',         inputType: 'date' },
      { key: 'time',         label: 'Time',         inputType: 'time' },
      { key: 'location',     label: 'Location',     inputType: 'text' },
      { key: 'participants', label: 'Participants',  inputType: 'text' },
    ],
  },
  entity: {
    fields: [
      { key: 'location', label: 'Location', inputType: 'text' },
      { key: 'website',  label: 'Website',  inputType: 'url'  },
    ],
  },
};

// ─── All thought types ────────────────────────────────────────────────────────
// `extends`  — key into TYPE_BASES; those fields come first
// `overrides`— per-key label/options overrides on the base fields
// `fields`   — type-specific fields appended after base fields
// `color`    — dot color used in Tooltip and MentionAutocomplete
// `group`    — used to group the type dropdown with <optgroup>

export const TYPE_DEFINITIONS = {

  // ── Core ──────────────────────────────────────────────────────────────────
  idea: {
    label: 'Idea', group: 'Core', color: '#90CDF4',
    fields: [
      { key: 'status', label: 'Status', inputType: 'select',
        options: ['', 'Raw', 'Exploring', 'Validated', 'Shelved'] },
    ],
  },
  note: {
    label: 'Note', group: 'Core', color: '#68D391',
    fields: [
      { key: 'source',     label: 'Source',     inputType: 'text' },
      { key: 'date_noted', label: 'Date Noted', inputType: 'date' },
    ],
  },
  question: {
    label: 'Question', group: 'Core', color: '#FC8181',
    fields: [
      { key: 'answer', label: 'Answer', inputType: 'textarea' },
      { key: 'status', label: 'Status', inputType: 'select',
        options: ['', 'Open', 'Answered', "Won't Answer"] },
    ],
  },
  task: {
    label: 'Task', group: 'Core', color: '#F6AD55',
    fields: [
      { key: 'priority', label: 'Priority', inputType: 'select',
        options: ['', 'Low', 'Medium', 'High', 'Critical'] },
      { key: 'status', label: 'Status', inputType: 'select',
        options: ['', 'Todo', 'In Progress', 'Blocked', 'Done', 'Cancelled'] },
      { key: 'due_date',          label: 'Due Date',        inputType: 'date'   },
      { key: 'estimated_effort',  label: 'Effort',          inputType: 'select',
        options: ['', 'Small', 'Medium', 'Large'] },
    ],
  },

  // ── Creative Work ─────────────────────────────────────────────────────────
  book: {
    label: 'Book', group: 'Creative Work', color: '#B794F4',
    extends: 'creative_work',
    overrides: {
      creator: { label: 'Author' },
      year:    { label: 'Published' },
      status:  { options: ['', 'Want to Read', 'Reading', 'Read'] },
    },
    fields: [
      { key: 'pages', label: 'Pages', inputType: 'number' },
      { key: 'isbn',  label: 'ISBN',  inputType: 'text'   },
    ],
  },
  movie: {
    label: 'Movie', group: 'Creative Work', color: '#B794F4',
    extends: 'creative_work',
    overrides: {
      creator: { label: 'Director' },
      year:    { label: 'Released' },
      status:  { options: ['', 'Want to Watch', 'Watched'] },
    },
    fields: [
      { key: 'runtime', label: 'Runtime (min)', inputType: 'number' },
    ],
  },
  tv_show: {
    label: 'TV Show', group: 'Creative Work', color: '#B794F4',
    extends: 'creative_work',
    overrides: {
      creator: { label: 'Creator' },
      year:    { label: 'Started' },
      status:  { options: ['', 'Want to Watch', 'Watching', 'Watched', 'Abandoned'] },
    },
    fields: [
      { key: 'seasons', label: 'Seasons', inputType: 'number' },
      { key: 'network', label: 'Network', inputType: 'text'   },
    ],
  },
  album: {
    label: 'Album', group: 'Creative Work', color: '#B794F4',
    extends: 'creative_work',
    overrides: {
      creator: { label: 'Artist' },
      year:    { label: 'Released' },
      status:  { options: ['', 'Want to Listen', 'Listening', 'Listened'] },
    },
    fields: [],
  },
  podcast: {
    label: 'Podcast', group: 'Creative Work', color: '#B794F4',
    extends: 'creative_work',
    overrides: {
      creator: { label: 'Host' },
      year:    { label: 'Started' },
      status:  { options: ['', 'Subscribed', 'Occasionally', 'Stopped'] },
    },
    fields: [
      { key: 'url', label: 'URL', inputType: 'url' },
    ],
  },
  article: {
    label: 'Article', group: 'Creative Work', color: '#B794F4',
    extends: 'creative_work',
    overrides: {
      creator: { label: 'Author' },
      year:    { label: 'Published' },
      status:  { options: ['', 'Want to Read', 'Read'] },
    },
    fields: [
      { key: 'url',         label: 'URL',         inputType: 'url'  },
      { key: 'publication', label: 'Publication', inputType: 'text' },
    ],
  },

  // ── Events ────────────────────────────────────────────────────────────────
  meeting: {
    label: 'Meeting', group: 'Event', color: '#FBD38D',
    extends: 'event',
    fields: [
      { key: 'agenda',       label: 'Agenda',       inputType: 'textarea' },
      { key: 'outcome',      label: 'Outcome',      inputType: 'textarea' },
      { key: 'action_items', label: 'Action Items', inputType: 'textarea' },
    ],
  },
  party: {
    label: 'Party', group: 'Event', color: '#FBD38D',
    extends: 'event',
    fields: [
      { key: 'host',  label: 'Host',  inputType: 'text' },
      { key: 'theme', label: 'Theme', inputType: 'text' },
    ],
  },
  appointment: {
    label: 'Appointment', group: 'Event', color: '#FBD38D',
    extends: 'event',
    fields: [
      { key: 'purpose', label: 'Purpose', inputType: 'text' },
    ],
  },
  deadline: {
    label: 'Deadline', group: 'Event', color: '#FC8181',
    fields: [
      { key: 'due_date', label: 'Due Date', inputType: 'date' },
      { key: 'priority', label: 'Priority', inputType: 'select',
        options: ['', 'Low', 'Medium', 'High', 'Critical'] },
      { key: 'related_project', label: 'Related Project', inputType: 'text' },
    ],
  },

  // ── People & Orgs ─────────────────────────────────────────────────────────
  person: {
    label: 'Person', group: 'People & Orgs', color: '#81E6D9',
    extends: 'entity',
    fields: [
      { key: 'role',         label: 'Role / Title', inputType: 'text'  },
      { key: 'organization', label: 'Organization', inputType: 'text'  },
      { key: 'email',        label: 'Email',        inputType: 'email' },
      { key: 'phone',        label: 'Phone',        inputType: 'text'  },
      { key: 'birthday',     label: 'Birthday',     inputType: 'date'  },
    ],
  },
  company: {
    label: 'Company', group: 'People & Orgs', color: '#81E6D9',
    extends: 'entity',
    fields: [
      { key: 'industry', label: 'Industry', inputType: 'text'   },
      { key: 'founded',  label: 'Founded',  inputType: 'number' },
      { key: 'size',     label: 'Size',     inputType: 'text'   },
    ],
  },

  // ── Places ────────────────────────────────────────────────────────────────
  place: {
    label: 'Place', group: 'Places', color: '#81E6D9',
    extends: 'entity',
    fields: [
      { key: 'address',    label: 'Address',    inputType: 'text'     },
      { key: 'place_type', label: 'Type',       inputType: 'text'     },
      { key: 'rating',     label: 'Rating',     inputType: 'rating'   },
      { key: 'visited',    label: 'Visited',    inputType: 'checkbox' },
    ],
  },
  restaurant: {
    label: 'Restaurant', group: 'Places', color: '#81E6D9',
    extends: 'entity',
    fields: [
      { key: 'address',     label: 'Address',     inputType: 'text'     },
      { key: 'cuisine',     label: 'Cuisine',     inputType: 'text'     },
      { key: 'price_range', label: 'Price Range', inputType: 'select',
        options: ['', '$', '$$', '$$$', '$$$$'] },
      { key: 'rating',      label: 'Rating',      inputType: 'rating'   },
      { key: 'visited',     label: 'Visited',     inputType: 'checkbox' },
    ],
  },

  // ── Projects & Learning ───────────────────────────────────────────────────
  project: {
    label: 'Project', group: 'Projects & Learning', color: '#F6AD55',
    fields: [
      { key: 'start_date', label: 'Start Date', inputType: 'date' },
      { key: 'end_date',   label: 'End Date',   inputType: 'date' },
      { key: 'status', label: 'Status', inputType: 'select',
        options: ['', 'Planning', 'Active', 'On Hold', 'Complete', 'Cancelled'] },
      { key: 'team', label: 'Team', inputType: 'text' },
    ],
  },
  goal: {
    label: 'Goal', group: 'Projects & Learning', color: '#90CDF4',
    fields: [
      { key: 'target_date', label: 'Target Date', inputType: 'date' },
      { key: 'category', label: 'Category', inputType: 'select',
        options: ['', 'Personal', 'Professional', 'Health', 'Financial', 'Learning'] },
      { key: 'progress', label: 'Progress', inputType: 'select',
        options: ['', 'Not Started', 'In Progress', 'Completed', 'Abandoned'] },
    ],
  },
  skill: {
    label: 'Skill', group: 'Projects & Learning', color: '#90CDF4',
    fields: [
      { key: 'proficiency', label: 'Proficiency', inputType: 'select',
        options: ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert'] },
      { key: 'resources', label: 'Learning Resources', inputType: 'textarea' },
    ],
  },
  research: {
    label: 'Research', group: 'Projects & Learning', color: '#E2E8F0',
    fields: [
      { key: 'authors',  label: 'Authors',        inputType: 'text'     },
      { key: 'journal',  label: 'Journal / Source', inputType: 'text'   },
      { key: 'year',     label: 'Year',           inputType: 'number'   },
      { key: 'url',      label: 'Link',           inputType: 'url'      },
      { key: 'abstract', label: 'Abstract',       inputType: 'textarea' },
    ],
  },

  // ── Other ─────────────────────────────────────────────────────────────────
  quote: {
    label: 'Quote', group: 'Other', color: '#E2E8F0',
    fields: [
      { key: 'quote_text', label: 'Quote',   inputType: 'textarea' },
      { key: 'source',     label: 'Source',  inputType: 'text'     },
      { key: 'context',    label: 'Context', inputType: 'text'     },
    ],
  },
  recipe: {
    label: 'Recipe', group: 'Other', color: '#68D391',
    fields: [
      { key: 'source',      label: 'Source',        inputType: 'text'     },
      { key: 'ingredients', label: 'Ingredients',   inputType: 'textarea' },
      { key: 'prep_time',   label: 'Prep Time (min)', inputType: 'number' },
      { key: 'cook_time',   label: 'Cook Time (min)', inputType: 'number' },
      { key: 'servings',    label: 'Servings',      inputType: 'number'   },
    ],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the full ordered field list for a type:
 * base fields (with overrides applied) + type-specific fields.
 */
export function resolveFields(typeName) {
  const def = TYPE_DEFINITIONS[typeName];
  if (!def) return [];

  let baseFields = [];
  if (def.extends && TYPE_BASES[def.extends]) {
    baseFields = TYPE_BASES[def.extends].fields.map(f => {
      const ov = def.overrides?.[f.key];
      if (!ov) return f;
      return { ...f, ...ov };
    });
  }

  return [...baseFields, ...(def.fields || [])];
}

/**
 * Flat list of all types for iteration (key, label, color, group).
 */
export const ALL_TYPES = Object.entries(TYPE_DEFINITIONS).map(([key, def]) => ({
  key,
  label: def.label,
  color: def.color,
  group: def.group,
}));

/**
 * Grouped map for <optgroup> rendering.
 * Returns { 'Core': [...], 'Creative Work': [...], ... }
 */
export function groupedTypes() {
  const groups = {};
  for (const t of ALL_TYPES) {
    if (!groups[t.group]) groups[t.group] = [];
    groups[t.group].push(t);
  }
  return groups;
}
