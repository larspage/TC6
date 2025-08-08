# ThoughtCatcher6 Architecture Overview - Memory Bank Document

## Document Purpose
This document provides a comprehensive architectural overview of the ThoughtCatcher6 application, including system design, technology stack, and integration patterns for development reference.

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express API    │    │    MongoDB      │
│                 │    │                 │    │                 │
│ - Canvas/SVG    │◄──►│ - REST Routes   │◄──►│ - Mind Maps     │
│ - Components    │    │ - Auth/JWT      │    │ - Users         │
│ - State Mgmt    │    │ - Validation    │    │ - Sessions      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack
**Frontend (Client)**:
- React 18+ with Hooks
- SVG for canvas rendering
- CSS3 with responsive design
- Local storage for offline capability

**Backend (Server)**:
- Node.js runtime
- Express.js web framework
- Mongoose ODM for MongoDB
- JWT for authentication
- bcrypt for password hashing

**Database**:
- MongoDB for document storage
- Indexes for query optimization
- GridFS for file attachments (future)

### Data Flow Architecture
```
User Action → React Component → API Service → Express Route → Mongoose Model → MongoDB
                     ↓
              State Update ← Response ← JSON Response ← Database Result ← Query Result
```

## Core Data Models

### MindMap Schema
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  user_id: ObjectId (ref: User),
  created_at: Date,
  updated_at: Date,
  is_public: Boolean,
  canvas_settings: {
    zoom: Number,
    pan_x: Number,
    pan_y: Number
  }
}
```

### Node Schema
```javascript
{
  _id: ObjectId,
  mindmap_id: ObjectId (ref: MindMap),
  text: String (required),
  position: {
    x: Number,
    y: Number
  },
  styling: {
    color: String,
    shape: String,
    size: Object
  },
  parent_id: ObjectId (ref: Node),
  level: Number,
  created_at: Date
}
```

### Connection Schema
```javascript
{
  _id: ObjectId,
  mindmap_id: ObjectId (ref: MindMap),
  from_node_id: ObjectId (ref: Node),
  to_node_id: ObjectId (ref: Node),
  connection_type: String,
  styling: {
    color: String,
    width: Number,
    style: String
  }
}
```

## API Design Patterns

### RESTful Endpoints
```
GET    /api/mindmaps           - List user's mind maps
POST   /api/mindmaps           - Create new mind map
GET    /api/mindmaps/:id       - Get specific mind map
PUT    /api/mindmaps/:id       - Update mind map
DELETE /api/mindmaps/:id       - Delete mind map

GET    /api/mindmaps/:id/nodes - Get all nodes for mind map
POST   /api/nodes              - Create new node
PUT    /api/nodes/:id          - Update node
DELETE /api/nodes/:id          - Delete node

POST   /api/connections        - Create connection
PUT    /api/connections/:id    - Update connection
DELETE /api/connections/:id    - Delete connection
```

### Authentication Flow
```
1. User Registration/Login → JWT Token
2. Token stored in localStorage
3. Token sent in Authorization header
4. Server validates token via middleware
5. User ID extracted for database queries
```

## Component Architecture

### React Component Hierarchy
```
App
├── AuthProvider
├── Router
│   ├── LoginPage
│   ├── DashboardPage
│   │   ├── MindMapList
│   │   └── MindMapCard
│   └── EditorPage
│       ├── Canvas
│       │   ├── Node
│       │   └── Connection
│       ├── Toolbar
│       └── PropertyPanel
```

### State Management Strategy
- **Local State**: Component-specific UI state
- **Context API**: User authentication, theme
- **Custom Hooks**: Data fetching, canvas operations
- **Local Storage**: Offline data, user preferences

## Security Considerations

### Authentication & Authorization
- JWT tokens with expiration
- Password hashing with bcrypt
- Protected routes with middleware
- Input validation and sanitization

### Data Protection
- CORS configuration
- Rate limiting on API endpoints
- SQL injection prevention (NoSQL)
- XSS protection with input sanitization

## Performance Optimization

### Frontend Optimization
- Component memoization with React.memo
- Lazy loading for large mind maps
- SVG optimization for canvas rendering
- Debounced auto-save functionality

### Backend Optimization
- Database indexing strategy
- Query optimization with aggregation
- Caching for frequently accessed data
- Connection pooling for MongoDB

## Development Environment

### Local Development Setup
```bash
# Install dependencies
npm install

# Environment variables
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/tc6
JWT_SECRET=your_secret_key

# Start development servers
npm run dev        # Starts both client and server
npm run client     # Client only (port 3000)
npm run server     # Server only (port 5000)
```

### Build & Deployment
```bash
# Production build
npm run build

# Production environment
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production_secret
```

## Integration Points

### Future AI Integration
- Stub AI service layer in Phase 1
- OpenAI API integration for idea generation
- Natural language processing for node creation
- Machine learning for layout optimization

### Third-Party Services
- File storage (AWS S3, Cloudinary)
- Email service (SendGrid, Mailgun)
- Analytics (Google Analytics, Mixpanel)
- Error tracking (Sentry, LogRocket)

---

*Last Updated: December 2024*
*Document Version: 1.0*
*Architecture Status: Foundation Complete, Core Features In Development*
