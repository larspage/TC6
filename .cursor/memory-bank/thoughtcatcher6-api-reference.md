# ThoughtCatcher6 API Reference - Memory Bank Document

## Document Purpose
This document provides a comprehensive API reference for the ThoughtCatcher6 application, including all endpoints, request/response formats, and authentication requirements.

## Base Configuration
- **Base URL**: `http://localhost:5000/api` (development)
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body**:
```json
{
  "username": "string (3-30 chars, required)",
  "email": "string (valid email, required)",
  "password": "string (min 6 chars, required)"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "created_at": "ISO date"
    },
    "token": "JWT_TOKEN_STRING"
  }
}
```

### POST /auth/login
Authenticate user and receive JWT token.

**Request Body**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "last_login": "ISO date"
    },
    "token": "JWT_TOKEN_STRING"
  }
}
```

### POST /auth/forgot-password
Request password reset email.

**Request Body**:
```json
{
  "email": "string (required)"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

## Mind Maps Endpoints

### GET /mindmaps
Get all mind maps for authenticated user.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 10, max: 50)
- `search`: string (search in title/description)
- `sort`: string (created_at, updated_at, title)
- `order`: string (asc, desc)

**Response (200)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "created_at": "ISO date",
      "updated_at": "ISO date",
      "node_count": "number",
      "is_public": "boolean"
    }
  ],
  "pagination": {
    "current_page": "number",
    "total_pages": "number",
    "total_count": "number",
    "has_next": "boolean",
    "has_prev": "boolean"
  }
}
```

### POST /mindmaps
Create a new mind map.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "title": "string (1-100 chars, required)",
  "description": "string (max 500 chars, optional)",
  "is_public": "boolean (default: false)"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Mind map created successfully",
  "data": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "user_id": "string",
    "is_public": "boolean",
    "created_at": "ISO date",
    "updated_at": "ISO date"
  }
}
```

### GET /mindmaps/:id
Get specific mind map with all nodes and connections.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "user_id": "string",
    "is_public": "boolean",
    "canvas_settings": {
      "zoom": "number",
      "pan_x": "number",
      "pan_y": "number"
    },
    "nodes": [
      {
        "_id": "string",
        "text": "string",
        "position": {
          "x": "number",
          "y": "number"
        },
        "styling": {
          "color": "string",
          "shape": "string",
          "width": "number",
          "height": "number"
        },
        "parent_id": "string|null",
        "level": "number"
      }
    ],
    "connections": [
      {
        "_id": "string",
        "from_node_id": "string",
        "to_node_id": "string",
        "connection_type": "string",
        "styling": {
          "color": "string",
          "width": "number",
          "style": "string"
        }
      }
    ],
    "created_at": "ISO date",
    "updated_at": "ISO date"
  }
}
```

### PUT /mindmaps/:id
Update mind map metadata.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "is_public": "boolean (optional)",
  "canvas_settings": {
    "zoom": "number (optional)",
    "pan_x": "number (optional)",
    "pan_y": "number (optional)"
  }
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Mind map updated successfully",
  "data": {
    "_id": "string",
    "title": "string",
    "description": "string",
    "is_public": "boolean",
    "canvas_settings": "object",
    "updated_at": "ISO date"
  }
}
```

### DELETE /mindmaps/:id
Delete mind map and all associated nodes/connections.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:
```json
{
  "success": true,
  "message": "Mind map deleted successfully"
}
```

## Nodes Endpoints

### POST /nodes
Create a new node in a mind map.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "mindmap_id": "string (required)",
  "text": "string (1-500 chars, required)",
  "position": {
    "x": "number (required)",
    "y": "number (required)"
  },
  "styling": {
    "color": "string (hex color, optional)",
    "shape": "string (rectangle|circle|rounded, optional)",
    "width": "number (optional)",
    "height": "number (optional)"
  },
  "parent_id": "string (optional)"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Node created successfully",
  "data": {
    "_id": "string",
    "mindmap_id": "string",
    "text": "string",
    "position": "object",
    "styling": "object",
    "parent_id": "string|null",
    "level": "number",
    "created_at": "ISO date"
  }
}
```

### PUT /nodes/:id
Update existing node.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "text": "string (optional)",
  "position": {
    "x": "number (optional)",
    "y": "number (optional)"
  },
  "styling": {
    "color": "string (optional)",
    "shape": "string (optional)",
    "width": "number (optional)",
    "height": "number (optional)"
  }
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Node updated successfully",
  "data": {
    "_id": "string",
    "text": "string",
    "position": "object",
    "styling": "object",
    "updated_at": "ISO date"
  }
}
```

### DELETE /nodes/:id
Delete node and all child nodes.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:
```json
{
  "success": true,
  "message": "Node deleted successfully",
  "data": {
    "deleted_nodes": ["string"],
    "deleted_connections": ["string"]
  }
}
```

## Connections Endpoints

### POST /connections
Create connection between two nodes.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "mindmap_id": "string (required)",
  "from_node_id": "string (required)",
  "to_node_id": "string (required)",
  "connection_type": "string (parent-child|manual, default: manual)",
  "styling": {
    "color": "string (optional)",
    "width": "number (optional)",
    "style": "string (solid|dashed|dotted, optional)"
  }
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Connection created successfully",
  "data": {
    "_id": "string",
    "mindmap_id": "string",
    "from_node_id": "string",
    "to_node_id": "string",
    "connection_type": "string",
    "styling": "object",
    "created_at": "ISO date"
  }
}
```

### PUT /connections/:id
Update connection styling.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "styling": {
    "color": "string (optional)",
    "width": "number (optional)",
    "style": "string (optional)"
  }
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Connection updated successfully",
  "data": {
    "_id": "string",
    "styling": "object",
    "updated_at": "ISO date"
  }
}
```

### DELETE /connections/:id
Delete connection.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:
```json
{
  "success": true,
  "message": "Connection deleted successfully"
}
```

## Export Endpoints

### GET /mindmaps/:id/export/png
Export mind map as PNG image.

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `width`: number (default: 1200)
- `height`: number (default: 800)
- `quality`: number (1-4, default: 2)

**Response**: Binary PNG data with appropriate headers

### GET /mindmaps/:id/export/json
Export mind map data as JSON.

**Headers**: `Authorization: Bearer <token>`

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "mindmap": "object",
    "nodes": "array",
    "connections": "array",
    "export_date": "ISO date",
    "version": "string"
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "string",
      "message": "string"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or missing token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "retry_after": "number (seconds)"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Rate Limiting
- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Export endpoints**: 10 requests per hour per user

## WebSocket Events (Future)
Real-time collaboration events for Phase 6:

### Client → Server Events
- `join_mindmap`: Join mind map for real-time updates
- `leave_mindmap`: Leave mind map session
- `node_update`: Real-time node changes
- `cursor_move`: Cursor position updates

### Server → Client Events
- `user_joined`: User joined mind map
- `user_left`: User left mind map
- `node_updated`: Node was updated by another user
- `cursor_update`: Other user's cursor position

---

*Last Updated: December 2024*
*Document Version: 1.0*
*API Status: Phase 1-4 endpoints defined, Phase 5-6 planned*
