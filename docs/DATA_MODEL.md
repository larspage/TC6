# TC6 — Data Model Reference

All models live in `server/src/models/`. Mongoose with MongoDB 8.0.

---

## User

**File:** `server/src/models/User.js`
**Collection:** `users`

| Field                  | Type    | Required | Notes                              |
|------------------------|---------|----------|------------------------------------|
| `username`             | String  | Yes      | 3–30 chars, unique                 |
| `email`                | String  | Yes      | unique, validated format           |
| `password`             | String  | Yes      | bcrypt hashed, min 6 chars         |
| `created_at`           | Date    | —        | default: now                       |
| `last_login`           | Date    | —        | updated on login                   |
| `resetPasswordToken`   | String  | —        | for password reset flow            |
| `resetPasswordExpires` | Date    | —        | token expiry (1 hour window)       |
| `preferences.theme`    | String  | —        | default: `'light'`                 |
| `preferences.auto_save_interval` | Number | — | default: 5000 (ms)          |

**Indexes:** `email` (unique), `username` (unique)

---

## MindMap

**File:** `server/src/models/MindMap.js`
**Collection:** `mindmaps`

| Field                    | Type      | Required | Notes                        |
|--------------------------|-----------|----------|------------------------------|
| `title`                  | String    | Yes      | 1–100 chars                  |
| `description`            | String    | No       | max 500 chars                |
| `user_id`                | ObjectId  | Yes      | ref: User                    |
| `is_public`              | Boolean   | —        | default: false               |
| `canvas_settings.zoom`   | Number    | —        | default: 1                   |
| `canvas_settings.pan_x`  | Number    | —        | default: 0                   |
| `canvas_settings.pan_y`  | Number    | —        | default: 0                   |
| `createdAt` / `updatedAt`| Date      | —        | Mongoose timestamps          |

**Indexes:** `user_id`

---

## Node (Thought)

**File:** `server/src/models/Node.js`
**Collection:** `nodes`

| Field          | Type      | Required | Notes                                          |
|----------------|-----------|----------|------------------------------------------------|
| `mindmap_id`   | ObjectId  | Yes      | ref: MindMap                                   |
| `text`         | String    | Yes      | 1–500 chars — this is the node **title**       |
| `position.x`   | Number    | Yes      | canvas X coordinate (stored, not used by D3)   |
| `position.y`   | Number    | Yes      | canvas Y coordinate                            |
| `styling.color`| String    | No       | hex color override                             |
| `styling.shape`| String    | No       | enum: `rectangle`, `circle`, `rounded`         |
| `styling.width`| Number    | No       | —                                              |
| `styling.height`| Number   | No       | —                                              |
| `parent_id`    | ObjectId  | No       | ref: Node — hierarchical parent                |
| `level`        | Number    | —        | default: 0 (root)                              |
| `thought_type` | String    | —        | enum: `idea`, `task`, `note`, `question`       |
| `description`  | String    | —        | max 2000 chars, supports `[[Node Title]]` links|
| `tags`         | [String]  | —        | array of tag strings                           |
| `createdAt` / `updatedAt` | Date | —     | Mongoose timestamps                            |

**Indexes:** `mindmap_id`, `(mindmap_id, parent_id)`

> **Note:** `text` is the node title displayed on the canvas. `description` is the rich body
> field that supports `[[wiki-style links]]` via @mention autocomplete.

---

## Connection (Graph Edge)

**File:** `server/src/models/Connection.js`
**Collection:** `connections`

| Field             | Type     | Required | Notes                                         |
|-------------------|----------|----------|-----------------------------------------------|
| `mindmap_id`      | ObjectId | Yes      | ref: MindMap                                  |
| `from_node_id`    | ObjectId | Yes      | ref: Node — edge source                       |
| `to_node_id`      | ObjectId | Yes      | ref: Node — edge target                       |
| `connection_type` | String   | —        | enum: `parent-child`, `manual`, `mention`     |
| `styling.color`   | String   | No       | stroke color                                  |
| `styling.width`   | Number   | No       | stroke width                                  |
| `styling.style`   | String   | No       | enum: `solid`, `dashed`, `dotted`             |
| `createdAt` / `updatedAt` | Date | —     | Mongoose timestamps                           |

**Indexes:** `mindmap_id`

**connection_type values:**
- `parent-child` — hierarchical tree edges (set by seed/import scripts)
- `manual` — user-drawn connections or manually added links from the Links panel
- `mention` — created automatically when `[[Node Title]]` is saved in a description

> **Direction:** The canvas treats all connections as **undirected** for BFS. Direction is
> meaningful for backlink queries: `to_node_id` receives the backlink when `from_node_id`
> contains the `[[mention]]`.
