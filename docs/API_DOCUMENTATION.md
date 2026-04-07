# Notetaker API Documentation

A lightweight note-taking service with wiki-style linking, UUID-based identifiers, and graph data export. Designed to be embedded in consuming applications.

## Overview

The Notetaker service provides:
- **UUID-based note identification** for stable cross-system references
- **Wiki-style linking** using `[[Link Text]]` syntax
- **Automatic link tracking** in `outgoingLinks` arrays
- **Graph data export** showing all notes and their relationships
- **Embeddable UI** via the `/standalone` route

## Base URL

```
http://localhost:3100
```

## Data Structures

### Note Object

```typescript
interface Note {
  id: string;           // UUID (e.g., "64437ba9-9a47-440e-ae7b-ddd6087034fe")
  title: string;        // Note title
  content?: string;     // Note content with optional [[wiki links]]
  outgoingLinks?: Array<{
    linkText: string;     // Display text from [[linkText]]
    targetNoteId: string; // UUID of target note
  }>;
  incomingLinks?: Array<{
    linkText: string;
    targetNoteId: string;
  }>;
  createdAt?: string;   // ISO timestamp
  updatedAt?: string;   // ISO timestamp
}
```

### Graph Data

```typescript
interface NoteGraph {
  notes: Array<{
    id: string;
    title: string;
  }>;
  links: Array<{
    source: string;  // UUID of source note
    target: string;  // UUID of target note
    text: string;    // Display text
  }>;
}
```

## API Endpoints

### GET /api/notes

List all notes, sorted by most recently updated first.

**Response:**
```json
[
  {
    "id": "64437ba9-9a47-440e-ae7b-ddd6087034fe",
    "title": "First Note",
    "content": "This is my first note",
    "outgoingLinks": [],
    "incomingLinks": [],
    "createdAt": "2026-04-02T14:40:33.417Z",
    "updatedAt": "2026-04-02T14:40:33.417Z"
  }
]
```

---

### POST /api/notes

Create a new note. Accepts external UUIDs. Auto-generates UUID if not provided.

**Request Body:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "My Note Title",
  "content": "Note content with [[Another Note]] link",
  "outgoingLinks": [
    {
      "linkText": "Another Note",
      "targetNoteId": "64437ba9-9a47-440e-ae7b-ddd6087034fe"
    }
  ]
}
```

**Optional Fields:**
- `id`: If omitted, auto-generated UUID
- `outgoingLinks`: If omitted, empty array
- `incomingLinks`: If omitted, empty array

**Response:** `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "My Note Title",
  "content": "Note content with [[Another Note]] link",
  "outgoingLinks": [
    {
      "linkText": "Another Note",
      "targetNoteId": "64437ba9-9a47-440e-ae7b-ddd6087034fe"
    }
  ],
  "incomingLinks": [],
  "createdAt": "2026-04-02T15:30:00.000Z",
  "updatedAt": "2026-04-02T15:30:00.000Z"
}
```

---

### GET /api/notes/{id}

Get a single note by UUID.

**Response:**
```json
{
  "id": "64437ba9-9a47-440e-ae7b-ddd6087034fe",
  "title": "First Note",
  "content": "Content here",
  "outgoingLinks": []
}
```

---

### PUT /api/notes/{id}

Update a note. Links are re-parsed from content automatically if saving via the UI.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content with [[New Link]]",
  "outgoingLinks": [
    {
      "linkText": "New Link",
      "targetNoteId": "6a3ee79f-4c62-46d6-814f-80aa1b440723"
    }
  ]
}
```

**Response:**
```json
{
  "id": "64437ba9-9a47-440e-ae7b-ddd6087034fe",
  "title": "Updated Title",
  "content": "Updated content with [[New Link]]",
  "outgoingLinks": [
    {
      "linkText": "New Link",
      "targetNoteId": "6a3ee79f-4c62-46d6-814f-80aa1b440723"
    }
  ],
  "updatedAt": "2026-04-02T15:35:00.000Z"
}
```

---

### DELETE /api/notes/{id}

Delete a note by UUID.

**Response:** `200 OK`
```json
{
  "message": "Note deleted"
}
```

---

### GET /api/graph

Export all notes and links as a graph structure.

**Response:**
```json
{
  "notes": [
    { "id": "64437ba9-...", "title": "First Note" },
    { "id": "6a3ee79f-...", "title": "Second Note" },
    { "id": "015b3e37-...", "title": "Link Test Note" }
  ],
  "links": [
    {
      "source": "015b3e37-...",
      "target": "64437ba9-...",
      "text": "First Note"
    }
  ]
}
```

## Wiki Link Syntax

Users can create links between notes using double brackets:

```
This note links to [[Another Note Title]] in the system.
```

**Rules:**
- Links are case-insensitive ("[[First Note]]" matches "first note")
- Links resolve to existing notes by title match
- Clicking a link navigates to that note
- If no note exists, one is created with that title
- Outgoing links are stored in the `outgoingLinks` array

## Embedding in Consumer Applications

### Method 1: Direct API Integration

```javascript
// Create a note from your app
const response = await fetch('http://localhost:3100/api/notes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'your-uuid-here',           // Optional: provide your own UUID
    title: 'Note from My App',
    content: 'Content with [[Existing Note]] link',
    outgoingLinks: [
      { linkText: 'Existing Note', targetNoteId: 'existing-uuid' }
    ]
  })
});

const note = await response.json();
console.log('Created:', note.id);  // UUID for reference
```

### Method 2: Embed Notetaker UI

```jsx
import { useState } from 'react';

function MyApp() {
  const [showNotetaker, setShowNotetaker] = useState(false);
  const [graphData, setGraphData] = useState(null);

  const handleClose = (data) => {
    setGraphData(data);
    setShowNotetaker(false);
  };

  return (
    <div>
      {!showNotetaker ? (
        <button onClick={() => setShowNotetaker(true)}>
          Open Notetaker
        </button>
      ) : (
        <iframe
          src="http://localhost:3100/standalone"
          style={{ width: '100%', height: '600px', border: 'none' }}
        />
      )}
      
      {graphData && (
        <pre>{JSON.stringify(graphData, null, 2)}</pre>
      )}
    </div>
  );
}
```

**Note:** For the embedded UI with callback handling, see the reference implementation in `/app/standalone/page.tsx`.

## Environment Configuration

Create `.env.local`:

```
MONGODB_URI=mongodb://127.0.0.1:27017/notetaker
```

Default port: **3100**

## Running the Service

```bash
cd /mnt/data/projects/notetaker
npm install
npm run dev
```

Access at: http://localhost:3100/standalone

## Link Data Flow

1. User types `[[Target Note Title]]` in content
2. On save, system parses content for `[[...]]` patterns
3. For each match, finds note by title (case-insensitive)
4. Stores in `outgoingLinks`: `{ linkText, targetNoteId }`
5. `/api/graph` aggregates all links across all notes
6. Consumer app receives graph with `source` → `target` relationships

## UUID Strategy

- **External systems** can provide their own UUIDs
- **Auto-generated** if not provided (randomUUID with crypto fallback)
- **Stable references** allow cross-system note linking
- **Self-contained** - all IDs are UUIDs, no auto-increment

## Examples

### Creating a note with external UUID

```bash
curl -X POST http://localhost:3100/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "title": "Customer Profile: ACME Corp",
    "content": "Key contact is [[John Smith]]. Previous vendor was [[Old Vendor Inc]].",
    "outgoingLinks": [
      {"linkText": "John Smith", "targetNoteId": "550e8400-..."},
      {"linkText": "Old Vendor Inc", "targetNoteId": "6ba7b810-..."}
    ]
  }'
```

### Getting graph for visualization

```bash
curl http://localhost:3100/api/graph | jq '.'
```

### Finding all notes linking to a target

```javascript
const response = await fetch('http://localhost:3100/api/notes');
const notes = await response.json();

// Find all notes that link TO a specific note
const targetId = '64437ba9-...';
const linkingNotes = notes.filter(n => 
  n.outgoingLinks?.some(link => link.targetNoteId === targetId)
);
```
