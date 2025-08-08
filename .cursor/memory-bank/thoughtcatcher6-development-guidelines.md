# ThoughtCatcher6 Development Guidelines - Memory Bank Document

## Document Purpose
This document establishes coding standards, development practices, and team guidelines for the ThoughtCatcher6 project to ensure consistent, maintainable, and high-quality code.

## Code Style & Standards

### JavaScript/React Conventions
```javascript
// Use functional components with hooks
const MindMapCanvas = ({ mindMapId, onNodeCreate }) => {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  
  // Custom hooks for complex logic
  const { saveNode, deleteNode } = useNodeOperations(mindMapId);
  
  // Event handlers with descriptive names
  const handleNodeClick = useCallback((nodeId) => {
    setSelectedNode(nodeId);
  }, []);
  
  return (
    <svg className="canvas" viewBox="0 0 1000 1000">
      {nodes.map(node => (
        <Node 
          key={node._id}
          data={node}
          isSelected={selectedNode === node._id}
          onClick={() => handleNodeClick(node._id)}
        />
      ))}
    </svg>
  );
};
```

### Naming Conventions
- **Components**: PascalCase (`MindMapCanvas`, `NodeEditor`)
- **Files**: kebab-case (`mind-map-canvas.js`, `node-editor.js`)
- **Variables/Functions**: camelCase (`selectedNode`, `handleNodeClick`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `DEFAULT_NODE_COLOR`)
- **CSS Classes**: kebab-case (`mind-map-canvas`, `node-selected`)

### File Organization
```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button/
│   │   ├── Modal/
│   │   └── ColorPicker/
│   ├── canvas/           # Canvas-specific components
│   │   ├── Canvas/
│   │   ├── Node/
│   │   └── Connection/
│   └── pages/            # Page-level components
│       ├── Dashboard/
│       └── Editor/
├── hooks/                # Custom React hooks
│   ├── useNodeOperations.js
│   ├── useCanvasInteraction.js
│   └── useAutoSave.js
├── services/             # API and external services
│   ├── api.js
│   ├── mindMapService.js
│   └── authService.js
├── utils/                # Helper functions
│   ├── canvas-utils.js
│   ├── validation.js
│   └── constants.js
└── styles/               # Global styles
    ├── globals.css
    ├── variables.css
    └── components.css
```

## Component Development Patterns

### Component Structure Template
```javascript
import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './ComponentName.css';

/**
 * ComponentName - Brief description of component purpose
 * @param {Object} props - Component props
 * @param {string} props.requiredProp - Description of required prop
 * @param {function} props.onAction - Callback function description
 */
const ComponentName = ({ requiredProp, onAction, optionalProp = 'default' }) => {
  // State declarations
  const [localState, setLocalState] = useState(null);
  
  // Custom hooks
  const { data, loading, error } = useCustomHook(requiredProp);
  
  // Event handlers
  const handleAction = useCallback((event) => {
    // Handle the action
    onAction?.(event.target.value);
  }, [onAction]);
  
  // Effects
  useEffect(() => {
    // Side effects
  }, [requiredProp]);
  
  // Early returns for loading/error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  // Main render
  return (
    <div className="component-name">
      {/* Component JSX */}
    </div>
  );
};

ComponentName.propTypes = {
  requiredProp: PropTypes.string.isRequired,
  onAction: PropTypes.func,
  optionalProp: PropTypes.string
};

export default ComponentName;
```

### Custom Hooks Pattern
```javascript
// useNodeOperations.js
import { useState, useCallback } from 'react';
import { nodeService } from '../services/nodeService';

export const useNodeOperations = (mindMapId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const createNode = useCallback(async (nodeData) => {
    setLoading(true);
    setError(null);
    try {
      const newNode = await nodeService.create(mindMapId, nodeData);
      return newNode;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mindMapId]);
  
  const updateNode = useCallback(async (nodeId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const updatedNode = await nodeService.update(nodeId, updates);
      return updatedNode;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    createNode,
    updateNode,
    loading,
    error
  };
};
```

## API Development Standards

### Express Route Structure
```javascript
// routes/api/mindmaps.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const MindMap = require('../../models/MindMap');

/**
 * @route   GET /api/mindmaps
 * @desc    Get all mind maps for authenticated user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const mindMaps = await MindMap.find({ user_id: req.user.id })
      .sort({ updated_at: -1 })
      .select('title description created_at updated_at');
    
    res.json({
      success: true,
      data: mindMaps,
      count: mindMaps.length
    });
  } catch (error) {
    console.error('Error fetching mind maps:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred'
    });
  }
});

/**
 * @route   POST /api/mindmaps
 * @desc    Create new mind map
 * @access  Private
 */
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be 1-100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters')
], async (req, res) => {
  // Validation check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  try {
    const mindMap = new MindMap({
      title: req.body.title,
      description: req.body.description,
      user_id: req.user.id
    });
    
    await mindMap.save();
    
    res.status(201).json({
      success: true,
      data: mindMap,
      message: 'Mind map created successfully'
    });
  } catch (error) {
    console.error('Error creating mind map:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create mind map'
    });
  }
});

module.exports = router;
```

### Error Handling Standards
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry found'
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

module.exports = errorHandler;
```

## Testing Standards

### Unit Test Structure
```javascript
// __tests__/components/Node.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Node from '../Node';

describe('Node Component', () => {
  const mockProps = {
    data: {
      _id: '123',
      text: 'Test Node',
      position: { x: 100, y: 200 },
      styling: { color: '#blue' }
    },
    isSelected: false,
    onClick: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders node with correct text', () => {
    render(<Node {...mockProps} />);
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });
  
  it('calls onClick when node is clicked', () => {
    render(<Node {...mockProps} />);
    fireEvent.click(screen.getByText('Test Node'));
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });
  
  it('applies selected styling when isSelected is true', () => {
    render(<Node {...mockProps} isSelected={true} />);
    const nodeElement = screen.getByText('Test Node').closest('.node');
    expect(nodeElement).toHaveClass('node-selected');
  });
});
```

### API Test Structure
```javascript
// __tests__/api/mindmaps.test.js
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const MindMap = require('../../models/MindMap');

describe('MindMaps API', () => {
  let authToken;
  let userId;
  
  beforeEach(async () => {
    // Setup test user and auth token
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword'
    });
    userId = user._id;
    authToken = generateJWT(user._id);
  });
  
  afterEach(async () => {
    // Cleanup
    await User.deleteMany({});
    await MindMap.deleteMany({});
  });
  
  describe('GET /api/mindmaps', () => {
    it('should return user mind maps', async () => {
      // Create test mind map
      await MindMap.create({
        title: 'Test Map',
        user_id: userId
      });
      
      const response = await request(app)
        .get('/api/mindmaps')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe('Test Map');
    });
  });
});
```

## Git Workflow & Standards

### Branch Naming Convention
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes
- `refactor/component-name` - Code refactoring
- `docs/documentation-update` - Documentation changes

### Commit Message Format
```
type(scope): brief description

Optional longer description explaining the change
in more detail if needed.

- Bullet points for specific changes
- Use present tense ("add" not "added")
- Limit first line to 50 characters
- Reference issues: Fixes #123
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Pull Request Template
```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
```

## Performance Guidelines

### React Performance
- Use `React.memo` for components that receive stable props
- Implement `useMemo` for expensive calculations
- Use `useCallback` for event handlers passed to child components
- Avoid creating objects/arrays in render methods
- Implement virtualization for large lists

### API Performance
- Implement pagination for large datasets
- Use database indexes for frequently queried fields
- Cache frequently accessed data
- Implement request rate limiting
- Use compression middleware

---

*Last Updated: December 2024*
*Document Version: 1.0*
*Guidelines Status: Active - All team members must follow*
