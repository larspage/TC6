# TC6 API Reference

Base URL: `/api`

All private routes require the header: `x-auth-token: <JWT>`

JWT tokens are issued on register and login. Tokens expire after 1 hour.

---

## Users

### GET /api/users
**Description:** Get the authenticated user's profile (by token).
**Auth:** Required
**Params / Body:** None
**Response:** `{ _id, username, email, createdAt, updatedAt }` — user object, password excluded
**Errors:**
- `500` — Server Error

---

### POST /api/users/register
**Description:** Register a new user account. Returns a JWT and basic user info.
**Auth:** Public
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| username | String | Yes | 3–30 characters |
| email | String | Yes | Must be valid email format |
| password | String | Yes | Minimum 6 characters |

**Response:** `{ token: String, user: { id, username, email } }`
**Errors:**
- `400` — Validation errors (see `errors` array)
- `400` — `{ errors: [{ msg: 'User already exists' }] }` — email already registered
- `500` — Server error

---

### POST /api/users/login
**Description:** Authenticate with email and password. Returns a JWT and basic user info.
**Auth:** Public
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| email | String | Yes | Must be valid email format |
| password | String | Yes | |

**Response:** `{ token: String, user: { id, username, email } }`
**Errors:**
- `400` — Validation errors (see `errors` array)
- `400` — `{ errors: [{ msg: 'Invalid Credentials' }] }` — email not found or wrong password
- `500` — Server error

---

### POST /api/users/forgot-password
**Description:** Request a password reset token. Stores the token on the user record. Email delivery is not yet configured; the token is saved but not sent.
**Auth:** Public
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| email | String | Yes | Must be valid email format |

**Response:** `{ msg: 'Password reset email sent (email sending is not yet configured)' }`
**Errors:**
- `400` — Validation errors
- `404` — `{ msg: 'User with that email does not exist' }`
- `500` — Server error

---

### POST /api/users/reset-password/:token
**Description:** Reset a user's password using a valid (unexpired) reset token.
**Auth:** Public
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| token | String | URL param | Reset token from forgot-password step |
| password | String | Yes | Minimum 6 characters (request body) |

**Response:** `{ msg: 'Password has been reset' }`
**Errors:**
- `400` — Validation errors
- `400` — `{ msg: 'Password reset token is invalid or has expired' }` — token not found or older than 1 hour
- `500` — Server error

---

## Mind Maps

### GET /api/mindmaps
**Description:** Get all mind maps owned by the authenticated user, sorted by most recently updated.
**Auth:** Required
**Params / Body:** None
**Response:** Array of MindMap objects `[{ _id, title, description, user_id, is_public, canvas_settings, updated_at, createdAt, updatedAt }]`
**Errors:**
- `500` — Server Error

---

### POST /api/mindmaps
**Description:** Create a new mind map.
**Auth:** Required
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | String | Yes | 1–100 characters |
| description | String | No | Max 500 characters |
| is_public | Boolean | No | Defaults to false |

**Response:** Created MindMap object
**Errors:**
- `400` — Validation errors (see `errors` array)
- `500` — Server Error

---

### GET /api/mindmaps/:id
**Description:** Get a single mind map by ID.
**Auth:** Required
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | ObjectId | URL param | Mind map ID |

**Response:** MindMap object
**Errors:**
- `401` — `{ msg: 'User not authorized' }` — mind map belongs to a different user
- `404` — `{ msg: 'Mind map not found' }`
- `500` — Server Error

---

### PUT /api/mindmaps/:id
**Description:** Update a mind map's title, description, visibility, or canvas settings. Send only the fields to change.
**Auth:** Required
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | ObjectId | URL param | Mind map ID |
| title | String | No | 1–100 characters |
| description | String | No | Max 500 characters |
| is_public | Boolean | No | |
| canvas_settings | Object | No | Arbitrary canvas state object |

**Response:** Updated MindMap object
**Errors:**
- `400` — Validation errors
- `401` — `{ msg: 'User not authorized' }`
- `404` — `{ msg: 'Mind map not found' }`
- `500` — Server Error

---

### DELETE /api/mindmaps/:id
**Description:** Delete a mind map. Does not cascade-delete nodes or connections (handle separately if needed).
**Auth:** Required
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | ObjectId | URL param | Mind map ID |

**Response:** `{ msg: 'Mind map removed' }`
**Errors:**
- `401` — `{ msg: 'User not authorized' }`
- `404` — `{ msg: 'Mind map not found' }`
- `500` — Server Error

---

## Nodes

### GET /api/nodes/:mindmap_id/search
**Description:** Search nodes by title (`text` field) within a mind map. Intended for `@mention` autocomplete. Returns at most 10 results. If more than 10 nodes match, returns an empty array so the caller can show a "Create new" prompt instead.
**Auth:** Required
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| mindmap_id | ObjectId | URL param | Mind map to search within |
| q | String | Query param | Search string; returns `[]` if empty or missing |

**Response:** Array of matching node objects with selected fields: `[{ _id, text, thought_type, description }]`; returns `[]` if `q` is empty or match count exceeds 10
**Errors:**
- `401` — `{ msg: 'User not authorized' }`
- `404` — `{ msg: 'Mind map not found' }`
- `500` — Server Error

---

### GET /api/nodes/:mindmap_id
**Description:** Get all nodes for a mind map, sorted by creation time ascending.
**Auth:** Required
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| mindmap_id | ObjectId | URL param | Mind map ID |

**Response:** Array of Node objects `[{ _id, mindmap_id, text, position, styling, parent_id, level, thought_type, description, tags, createdAt, updatedAt }]`
**Errors:**
- `401` — `{ msg: 'User not authorized' }`
- `404` — `{ msg: 'Mind map not found' }`
- `500` — Server Error

---

### POST /api/nodes
**Description:** Create a new node in a mind map.
**Auth:** Required
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| mindmap_id | ObjectId | Yes | Mind map the node belongs to |
| text | String | Yes | 1–500 characters; displayed as the node title |
| position.x | Number | Yes | Canvas X coordinate |
| position.y | Number | Yes | Canvas Y coordinate |
| styling | Object | No | `{ color, shape: 'rectangle'\|'circle'\|'rounded', width, height }` |
| parent_id | ObjectId | No | Parent node ID for tree structure |

**Response:** Created Node object
**Errors:**
- `400` — Validation errors (see `errors` array)
- `401` — `{ msg: 'User not authorized' }`
- `404` — `{ msg: 'Mind map not found' }`
- `500` — Server Error

---

### PUT /api/nodes/:id
**Description:** Update a node. Send only the fields to change.
**Auth:** Required
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | ObjectId | URL param | Node ID |
| text | String | No | 1–500 characters |
| position | Object | No | `{ x: Number, y: Number }` |
| styling | Object | No | `{ color, shape, width, height }` |
| description | String | No | Max 2000 characters |
| tags | Array | No | Array of strings |
| thought_type | String | No | `'idea'`, `'task'`, `'note'`, or `'question'` |

**Response:** Updated Node object
**Errors:**
- `400` — Validation errors
- `401` — `{ msg: 'User not authorized' }`
- `404` — `{ msg: 'Node not found' }`
- `500` — Server Error

---

### DELETE /api/nodes/:id
**Description:** Delete a node and recursively delete all of its children.
**Auth:** Required
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | ObjectId | URL param | Node ID |

**Response:** `{ msg: 'Node and its children removed' }`
**Errors:**
- `401` — `{ msg: 'User not authorized' }`
- `404` — `{ msg: 'Node not found' }`
- `500` — Server Error

---

## Connections

### GET /api/connections/node/:node_id
**Description:** Get all inbound and outbound `manual` and `mention` connections for a specific node. `parent-child` connections are excluded. Inbound = connections pointing **to** this node (backlinks). Outbound = connections pointing **from** this node.
**Auth:** Required
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| node_id | ObjectId | URL param | Node ID |

**Response:** `{ inbound: [Connection], outbound: [Connection] }` — both arrays contain full Connection objects; `parent-child` type is excluded from both
**Errors:**
- `401` — `{ msg: 'User not authorized' }`
- `404` — `{ msg: 'Node not found' }` or `{ msg: 'Mind map not found' }`
- `500` — Server Error

---

### GET /api/connections/:mindmap_id
**Description:** Get all connections for a mind map (all types, including `parent-child`).
**Auth:** Required
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| mindmap_id | ObjectId | URL param | Mind map ID |

**Response:** Array of Connection objects `[{ _id, mindmap_id, from_node_id, to_node_id, connection_type, styling, createdAt, updatedAt }]`
**Errors:**
- `401` — `{ msg: 'User not authorized' }`
- `404` — `{ msg: 'Mind map not found' }`
- `500` — Server Error

---

### POST /api/connections
**Description:** Create a new connection between two nodes.
**Auth:** Required
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| mindmap_id | ObjectId | Yes | Mind map both nodes belong to |
| from_node_id | ObjectId | Yes | Source node |
| to_node_id | ObjectId | Yes | Target node |
| connection_type | String | No | `'parent-child'`, `'manual'`, or `'mention'`; defaults to `'manual'` |
| styling | Object | No | `{ color: String, width: Number, style: 'solid'\|'dashed'\|'dotted' }` |

**Response:** Created Connection object
**Errors:**
- `400` — Validation errors (see `errors` array)
- `401` — `{ msg: 'User not authorized' }`
- `404` — `{ msg: 'Mind map not found' }`
- `500` — Server Error

---

### PUT /api/connections/:id
**Description:** Update a connection's styling.
**Auth:** Required
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | ObjectId | URL param | Connection ID |
| styling | Object | Yes | `{ color: String, width: Number, style: 'solid'\|'dashed'\|'dotted' }` |

**Response:** Updated Connection object
**Errors:**
- `400` — `{ errors: [...] }` — styling object missing
- `401` — `{ msg: 'User not authorized' }`
- `404` — `{ msg: 'Connection not found' }`
- `500` — Server Error

---

### DELETE /api/connections/:id
**Description:** Delete a connection by ID.
**Auth:** Required
**Params / Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | ObjectId | URL param | Connection ID |

**Response:** `{ msg: 'Connection removed' }`
**Errors:**
- `401` — `{ msg: 'User not authorized' }`
- `404` — `{ msg: 'Connection not found' }`
- `500` — Server Error
