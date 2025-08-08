# ThoughtCatcher6 - Development Guide

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local or cloud instance)
- Git for version control

### Setup
```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Environment configuration
cp .env.example .env
# Configure MongoDB connection and JWT secret in .env

# Start development servers
npm run dev  # Starts both client and server
```

## Project Structure

```
TC6/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── Canvas/     # Mind map canvas components
│   │   │   ├── Common/     # Shared UI components
│   │   │   └── Pages/      # Page-level components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API communication
│   │   └── utils/          # Helper functions
├── server/                 # Express.js backend
│   ├── models/             # MongoDB/Mongoose models
│   ├── routes/             # API route handlers
│   ├── middleware/         # Express middleware
│   └── utils/              # Server utilities
├── OldDocs/               # Legacy documentation (reference)
└── docs/                  # Current documentation
```

## Current Implementation Status

### ✅ Completed Features
- **MERN Stack Foundation**: Full setup with MongoDB, Express, React, Node.js
- **Canvas Prototype**: SVG-based mind map rendering
- **Node Management**: Create, edit, delete, and position nodes
- **Connection System**: Manual drawing and management of node connections
- **Drag & Drop**: Intuitive node positioning
- **Data Models**: Complete schema for MindMap, Node, Connection, User

### 🟡 In Progress
- **Auto-save Integration**: Connecting frontend auto-save to backend API
- **Canvas Refinements**: Improving user interactions and visual feedback

### 🔵 Ready to Start
- **User Authentication UI**: Login/registration forms and session management
- **Advanced Node Features**: Styling, rich content, hierarchical organization
- **Export Functionality**: PNG and JSON export capabilities

## Development Priorities

### Immediate (Phase 2 Completion)
1. **Auto-save Backend Integration**: Complete the connection between frontend auto-save and API
2. **User Authentication UI**: Implement login/register forms with proper validation
3. **Connection Rerouting**: Ensure connections update when nodes are moved
4. **Error Handling**: Add comprehensive error handling throughout the application

### Next Phase (MVP Core)
1. **Export System**: Implement PNG and JSON export functionality
2. **Data Persistence**: Ensure reliable saving and loading of mind maps
3. **Search & Filter**: Add ability to search and filter nodes
4. **Sharing Basics**: Simple mind map sharing capabilities

## Key Technical Decisions

### Frontend Architecture
- **React 18+** with functional components and hooks
- **SVG Canvas** for scalable mind map rendering
- **Component Library** approach for reusable UI elements
- **Local Storage** for offline capabilities and auto-save

### Backend Architecture
- **RESTful API** design with Express.js
- **JWT Authentication** for secure user sessions
- **Mongoose ODM** for MongoDB interactions
- **Modular Route Structure** for maintainable API organization

### Database Design
- **Document-based** storage optimized for hierarchical mind map data
- **Reference relationships** between MindMaps, Nodes, and Connections
- **User isolation** ensuring data privacy and security

## Development Workflow

### Code Quality
- **ESLint & Prettier** (pending configuration)
- **Git Hooks** for automated code quality checks
- **Component Testing** with React Testing Library
- **API Testing** with Jest and Supertest

### Deployment
- **Development**: Local servers with hot reload
- **Staging**: Cloud deployment for testing
- **Production**: Optimized build with CDN and database clustering

## Troubleshooting Common Issues

### Canvas Rendering
- Ensure SVG viewBox is properly configured
- Check for proper event handling on canvas elements
- Verify coordinate transformations for drag operations

### API Integration
- Confirm JWT tokens are properly included in requests
- Check CORS configuration for cross-origin requests
- Validate request/response data structures

### Database Connections
- Verify MongoDB connection string in environment variables
- Check network connectivity and authentication credentials
- Monitor connection pooling and timeout settings
