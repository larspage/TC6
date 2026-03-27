# TC6 ThoughtCatcher — Architecture Overview

## Stack

| Layer      | Technology                          | Port  |
|------------|-------------------------------------|-------|
| Frontend   | React 18 + Vite, D3.js              | 3670  |
| Backend    | Node.js / Express                   | 3671  |
| Database   | MongoDB 8.0 (Docker container)      | 27017 |
| Auth       | JWT via `x-auth-token` header       | —     |

## Repository Layout

```
TC6/
├── server/                     # Express backend
│   ├── index.js                # App entry point: middleware, routes, DB connect
│   ├── config/
│   │   ├── keys.js             # Reads MONGO_URI + JWT_SECRET from .env
│   │   └── logger.js           # Winston logger (daily rotate, combined/error logs)
│   ├── middleware/
│   │   └── auth.js             # JWT middleware — reads x-auth-token header
│   ├── routes/api/
│   │   ├── users.js            # Register, login, forgot/reset password
│   │   ├── mindmaps.js         # CRUD for mind maps
│   │   ├── nodes.js            # CRUD for nodes (thoughts)
│   │   └── connections.js      # CRUD for graph edges
│   └── src/models/
│       ├── User.js             # User schema
│       ├── MindMap.js          # MindMap schema
│       ├── Node.js             # Node (thought) schema
│       └── Connection.js       # Edge schema (from_node_id → to_node_id)
│
├── client/                     # Vite + React frontend
│   ├── src/
│   │   ├── main.jsx            # React root mount
│   │   ├── App.jsx             # Top-level: auth, data fetch, layout
│   │   ├── api.js              # All fetch wrappers (login, getMindmaps, etc.)
│   │   └── components/
│   │       └── MindMapCanvas.jsx  # D3 force graph + EditPanel + Tooltip
│   ├── vite.config.js          # Proxy /api → localhost:3671
│   └── index.html
│
├── docker-compose.yml          # MongoDB container (tc6-mongo, volume tc6-mongo-data)
├── .env                        # MONGO_URI, JWT_SECRET (not in git)
├── package.json                # Root: runs both server + client via concurrently
└── docs/                       # This documentation
```

## Request Flow

```
Browser
  │
  ├─ GET /  →  Vite dev server (port 3670)
  │             └─ serves React SPA
  │
  └─ /api/* →  Vite proxy  →  Express (port 3671)
                                ├─ auth middleware (JWT check)
                                ├─ route handler
                                └─ Mongoose → MongoDB (port 27017)
```

## Authentication

- All private routes require `x-auth-token: <JWT>` header.
- JWT payload: `{ user: { id: <mongo ObjectId> } }`
- Token expires in 1 hour. No refresh mechanism yet.
- Frontend auto-logs in with demo credentials on app load (`App.jsx`).

## Data Relationships

```
User  ──owns──►  MindMap  ──contains──►  Node  ◄──── Connection ────► Node
                                          │
                                          └── text, description, tags, thought_type
```

- A `Connection` has `mindmap_id`, `from_node_id`, `to_node_id`, `connection_type`.
- `connection_type` enum: `parent-child` | `manual` | `mention`
- The canvas treats all connections as undirected for BFS hop distance calculation.

## Starting the App

```bash
cd /mnt/data/projects/TC6
docker compose up -d        # start MongoDB container
npm run dev                 # starts both server (3671) + client (3670) via concurrently
```

Frontend: http://localhost:3670
Backend health: http://localhost:3671/health
