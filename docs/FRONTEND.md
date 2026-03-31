# TC6 — Frontend Reference

## Stack

- React 18 + Vite (port 3670)
- D3.js for force simulation
- Inline styles only (no CSS files / CSS modules)
- All API calls via `/api/*` proxied to Express (port 3671) by Vite

## Entry Points

| File | Role |
|------|------|
| `client/index.html` | HTML shell |
| `client/src/main.jsx` | React root mount (`ReactDOM.createRoot`) |
| `client/src/App.jsx` | Top-level: auth, data fetch, layout |
| `client/src/api.js` | Thin fetch wrappers for all API calls |

## Component Tree

```
App
└── MindMapCanvas          (flex row: canvas + resize handle + right panel)
    ├── [canvas area]
    │   ├── SVG             (D3 force graph, pan/zoom)
    │   ├── Tooltip         (hover card, position: absolute)
    │   └── [hint overlay]  (position: absolute, bottom-left)
    ├── [resize handle]     (6px, col-resize cursor, drag updates panelWidth)
    └── [right panel]       (always visible, width: panelWidth, default 340px)
        ├── [search bar]    (top; shows SearchResults list when active)
        └── EditPanel       (shows for active node when search is empty)
            ├── DescriptionEditor  (textarea with @mention autocomplete)
            │   └── MentionAutocomplete  (dropdown for @ trigger)
            └── LinksPanel         (inbound backlinks + outbound manual links)
                └── NodePreviewCard  (hover popup over link chips)
```

## App.jsx

**State shape:**
```js
{
  status: 'loading' | 'ready' | 'error',
  nodes: Node[],
  connections: Connection[],
  mapTitle: string,
  mindmapId: string,
  token: string,
  error: string | null,
}
```

**Startup flow:**
1. Auto-login with demo credentials → get JWT
2. Fetch mindmaps → take first map
3. Parallel fetch: `getNodes(token, mapId)` + `getConnections(token, mapId)`
4. Set state to `ready`

**Props passed to MindMapCanvas:**
- `nodes` — full node array
- `connections` — full connections array
- `token` — JWT
- `mindmapId` — current map's `_id`
- `onNodeCreated(newNode)` — appends a newly created node to App state

---

## MindMapCanvas.jsx

The main canvas component. Manages D3 simulation, pan/zoom, active node state, and all overlays.

**Props:** `{ nodes, connections, token, mindmapId, onNodeCreated }`

**Key state:**
| State | Purpose |
|-------|---------|
| `localNodes` | Local copy of nodes (updated optimistically on save) |
| `localConnections` | Local copy of connections (re-fetched when LinksPanel changes) |
| `activeNodeId` | Currently focused node (pinned at canvas center) |
| `editMode` | Whether EditPanel is visible |
| `transform` | `{ x, y, k }` pan/zoom transform |
| `hoveredNode` | Node under mouse cursor (for Tooltip) |

**Key refs:**
| Ref | Purpose |
|-----|---------|
| `posMap` | `{ [nodeId]: { x, y } }` — D3 simulation positions, read synchronously |
| `transformRef` | Sync copy of `transform` for use in event handlers |
| `sizeRef` | Sync copy of container dimensions |
| `simRef` | Current D3 ForceSimulation instance |
| `drag` | Current drag state `{ sx, sy, ox, oy }` |

**Graph logic:**
- `adjMap` — undirected adjacency map built from `localConnections`
- `hopMap` — BFS distances from `activeNodeId` (max 2 hops)
- `visibleNodes` — nodes within 2 hops of active node
- `visibleConns` — connections between visible nodes only

**Node click behavior:**
- Click active node → open EditPanel
- Click other node → clear posMap, set as active, close EditPanel

**Functions:**
- `handleNodeSave(updated)` — updates `localNodes` in place
- `refreshConnections()` — re-fetches connections from API, updates `localConnections`
- `handleNodeCreatedInPanel(newNode)` — adds node to `localNodes` + calls `onNodeCreated`

---

## EditPanel

Inline component inside MindMapCanvas.jsx (not a separate file).

**Props:** `{ node, token, mindmapId, allNodes, onSave, onClose, onNodeCreated, onNodeClick, onConnectionsChanged }`

**Autosave:**
- `scheduleAutosave()` — debounces a `PUT /api/nodes/:id` call 2 seconds after the last change
- `handleBlurSave()` — cancels timer and saves immediately when any field loses focus
- Fields: title (`input`), type (`select`), description (`DescriptionEditor`), tags (`input`)
- Explicit Save button also available; shows "Saved" hint for 1.5s on success

---

## DescriptionEditor.jsx

**Props:** `{ value, onChange, nodes, token, mindmapId, onNodeCreated }`

**@ detection:** On every keystroke, scans backwards from cursor to find last `@` (stops at newline). Extracts the query string. If the `@` span contains `]]`, the mention is already resolved — autocomplete dismissed.

**On select:** Replaces `@{query}` in the textarea with `[[{node.text}]]`.

**On create:** POSTs to `/api/nodes`, inserts `[[{newNode.text}]]`, calls `onNodeCreated`.

---

## MentionAutocomplete.jsx

**Props:** `{ query, nodes, position, onSelect, onCreate, onDismiss }`

**Filtering:** `node.text.toLowerCase().includes(query.toLowerCase())`
- 0 matches → shows "✦ Create: [query]" (if query.length > 0)
- 1–10 matches → shows list
- >10 matches → returns null (no dropdown)

**Keyboard:** ArrowUp/Down to navigate, Enter to confirm, Escape calls `onDismiss`.

---

## NodePreviewCard.jsx

**Props:** `{ node, position, onClick }`

Absolutely positioned hover card. Shows: title, thought_type badge (color-coded), description preview (120 char truncated). Clicking anywhere calls `onClick`.

**thought_type colors:** `{ idea: '#90CDF4', task: '#F6AD55', note: '#68D391', question: '#FC8181' }`

---

## LinksPanel.jsx

**Props:** `{ nodeId, mindmapId, token, allNodes, onNodeClick, onConnectionsChanged }`

**Data:** Fetches `GET /api/connections/node/:nodeId` on mount and when `nodeId` changes. Returns `{ inbound, outbound }`.

**Sections:**
1. **Backlinks** (inbound) — read-only chips. Click → `onNodeClick`.
2. **Outbound Links** (manual) — chips with ✕ delete. "+ Add" button opens type-ahead picker.
   - Picker filters `allNodes`, excludes self + already-linked nodes.
   - Selecting from picker: POSTs `connection_type: 'manual'` connection, then calls `onConnectionsChanged`.
   - Deleting: DELETEs connection, calls `onConnectionsChanged`.

**NodePreviewCard** shown on chip hover.

---

## api.js

All functions use the same internal `req(path, options)` helper that throws on non-OK responses.

| Function | Method | Path |
|----------|--------|------|
| `login(email, password)` | POST | `/users/login` |
| `getMindmaps(token)` | GET | `/mindmaps` |
| `getNodes(token, mindmapId)` | GET | `/nodes/:mindmapId` |
| `getConnections(token, mindmapId)` | GET | `/connections/:mindmapId` |
| `updateNode(token, nodeId, fields)` | PUT | `/nodes/:nodeId` |

Auth header: `x-auth-token: <token>`

---

## Design System

| Token | Value |
|-------|-------|
| Background dark | `#0F172A` |
| Surface | `#1E293B` |
| Border | `#334155` |
| Text primary | `#E2E8F0` |
| Text muted | `#94A3B8` |
| Text label | `#64748B` |
| Accent blue | `#42B4E6` |
| Accent blue (button) | `#2563EB` |
| Error | `#FC8181` |
| Font | `'Inter','Segoe UI',sans-serif` |

**HOP_STYLE** (node dimensions by BFS distance from active):
| Hop | Width | Height | Font size | Font weight |
|-----|-------|--------|-----------|-------------|
| 0 (active) | 200 | 68 | 15 | 700 |
| 1 | 158 | 52 | 12 | 600 |
| 2 | 124 | 42 | 10 | 400 |
