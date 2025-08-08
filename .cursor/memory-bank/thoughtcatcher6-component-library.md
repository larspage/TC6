# ThoughtCatcher6 Component Library - Memory Bank Document

## Document Purpose
This document provides a comprehensive reference for all React components in the ThoughtCatcher6 application, including props, usage examples, and implementation details.

## Component Categories

### 1. Canvas Components
Core components for the mind mapping canvas functionality.

#### Canvas
Main canvas container for mind map editing.

**Location**: `src/components/canvas/Canvas/Canvas.js`

**Props**:
```javascript
interface CanvasProps {
  mindMapId: string;           // Mind map ID to load
  isReadOnly?: boolean;        // Read-only mode for viewers
  onNodeCreate?: (position: {x: number, y: number}) => void;
  onNodeUpdate?: (nodeId: string, updates: object) => void;
  onNodeDelete?: (nodeId: string) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  className?: string;
}
```

**Usage Example**:
```javascript
import Canvas from './components/canvas/Canvas/Canvas';

const EditorPage = ({ mindMapId }) => {
  const handleNodeCreate = (position) => {
    console.log('Create node at:', position);
  };

  return (
    <Canvas
      mindMapId={mindMapId}
      onNodeCreate={handleNodeCreate}
      className="main-canvas"
    />
  );
};
```

**Key Features**:
- SVG-based rendering for scalability
- Zoom and pan functionality
- Multi-selection support
- Keyboard shortcuts (Delete, Ctrl+A, etc.)
- Touch support for mobile devices

#### Node
Individual node component for mind map nodes.

**Location**: `src/components/canvas/Node/Node.js`

**Props**:
```javascript
interface NodeProps {
  data: {
    _id: string;
    text: string;
    position: {x: number, y: number};
    styling: {
      color?: string;
      shape?: 'rectangle' | 'circle' | 'rounded';
      width?: number;
      height?: number;
    };
  };
  isSelected?: boolean;
  isEditing?: boolean;
  onTextChange?: (text: string) => void;
  onClick?: (nodeId: string) => void;
  onDoubleClick?: (nodeId: string) => void;
  onDragStart?: (nodeId: string) => void;
  onDragEnd?: (nodeId: string, newPosition: {x: number, y: number}) => void;
}
```

**Usage Example**:
```javascript
import Node from './components/canvas/Node/Node';

const NodeContainer = ({ nodeData, selected }) => {
  const handleTextChange = (newText) => {
    // Update node text
  };

  return (
    <Node
      data={nodeData}
      isSelected={selected}
      onTextChange={handleTextChange}
      onClick={(id) => console.log('Node clicked:', id)}
    />
  );
};
```

#### Connection
Connection lines between nodes.

**Location**: `src/components/canvas/Connection/Connection.js`

**Props**:
```javascript
interface ConnectionProps {
  data: {
    _id: string;
    from_node_id: string;
    to_node_id: string;
    styling: {
      color?: string;
      width?: number;
      style?: 'solid' | 'dashed' | 'dotted';
    };
  };
  fromPosition: {x: number, y: number};
  toPosition: {x: number, y: number};
  isSelected?: boolean;
  onClick?: (connectionId: string) => void;
}
```

### 2. UI Components
Reusable UI components used throughout the application.

#### Button
Standardized button component.

**Location**: `src/components/common/Button/Button.js`

**Props**:
```javascript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}
```

**Usage Example**:
```javascript
import Button from './components/common/Button/Button';

<Button 
  variant="primary" 
  size="medium" 
  onClick={handleSave}
  loading={isSaving}
>
  Save Mind Map
</Button>
```

#### Modal
Modal dialog component.

**Location**: `src/components/common/Modal/Modal.js`

**Props**:
```javascript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
}
```

#### ColorPicker
Color selection component.

**Location**: `src/components/common/ColorPicker/ColorPicker.js`

**Props**:
```javascript
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
  showCustomColors?: boolean;
  disabled?: boolean;
}
```

### 3. Form Components
Form-related components for user input.

#### Input
Standardized input field.

**Location**: `src/components/common/Input/Input.js`

**Props**:
```javascript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
}
```

#### TextArea
Multi-line text input.

**Location**: `src/components/common/TextArea/TextArea.js`

**Props**:
```javascript
interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  rows?: number;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  className?: string;
}
```

### 4. Layout Components
Components for page layout and structure.

#### Header
Application header with navigation.

**Location**: `src/components/layout/Header/Header.js`

**Props**:
```javascript
interface HeaderProps {
  user?: {
    username: string;
    avatar?: string;
  };
  onLogout?: () => void;
  showUserMenu?: boolean;
}
```

#### Sidebar
Collapsible sidebar for navigation.

**Location**: `src/components/layout/Sidebar/Sidebar.js`

**Props**:
```javascript
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  items: Array<{
    id: string;
    label: string;
    icon?: string;
    onClick: () => void;
    active?: boolean;
  }>;
}
```

#### Toolbar
Floating toolbar for canvas tools.

**Location**: `src/components/canvas/Toolbar/Toolbar.js`

**Props**:
```javascript
interface ToolbarProps {
  tools: Array<{
    id: string;
    icon: string;
    label: string;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
  }>;
  position?: 'top' | 'bottom' | 'left' | 'right';
  orientation?: 'horizontal' | 'vertical';
}
```

### 5. Page Components
Top-level page components.

#### DashboardPage
User dashboard with mind map library.

**Location**: `src/components/pages/Dashboard/Dashboard.js`

**Props**:
```javascript
interface DashboardProps {
  user: {
    _id: string;
    username: string;
    email: string;
  };
}
```

#### EditorPage
Mind map editor page.

**Location**: `src/components/pages/Editor/Editor.js`

**Props**:
```javascript
interface EditorProps {
  mindMapId: string;
  isReadOnly?: boolean;
}
```

#### LoginPage
User authentication page.

**Location**: `src/components/pages/Login/Login.js`

**Props**:
```javascript
interface LoginProps {
  onLoginSuccess: (user: object, token: string) => void;
  redirectTo?: string;
}
```

## Custom Hooks Reference

### useNodeOperations
Hook for node CRUD operations.

**Location**: `src/hooks/useNodeOperations.js`

```javascript
const useNodeOperations = (mindMapId: string) => {
  return {
    createNode: (nodeData: object) => Promise<Node>,
    updateNode: (nodeId: string, updates: object) => Promise<Node>,
    deleteNode: (nodeId: string) => Promise<void>,
    loading: boolean,
    error: string | null
  };
};
```

### useCanvasInteraction
Hook for canvas interaction logic.

**Location**: `src/hooks/useCanvasInteraction.js`

```javascript
const useCanvasInteraction = () => {
  return {
    selectedNodes: string[],
    setSelectedNodes: (nodeIds: string[]) => void,
    draggedNode: string | null,
    isDragging: boolean,
    canvasPosition: {x: number, y: number},
    zoomLevel: number,
    panCanvas: (deltaX: number, deltaY: number) => void,
    zoomCanvas: (delta: number, center?: {x: number, y: number}) => void
  };
};
```

### useAutoSave
Hook for automatic saving functionality.

**Location**: `src/hooks/useAutoSave.js`

```javascript
const useAutoSave = (data: object, saveFunction: Function, delay: number = 2000) => {
  return {
    saveStatus: 'idle' | 'saving' | 'saved' | 'error',
    lastSaved: Date | null,
    forceSave: () => Promise<void>
  };
};
```

### useMindMapData
Hook for mind map data management.

**Location**: `src/hooks/useMindMapData.js`

```javascript
const useMindMapData = (mindMapId: string) => {
  return {
    mindMap: MindMap | null,
    nodes: Node[],
    connections: Connection[],
    loading: boolean,
    error: string | null,
    refetch: () => Promise<void>
  };
};
```

## Styling Guidelines

### CSS Class Naming
All components follow BEM (Block Element Modifier) methodology:

```css
/* Block */
.mind-map-canvas { }

/* Element */
.mind-map-canvas__node { }
.mind-map-canvas__connection { }

/* Modifier */
.mind-map-canvas__node--selected { }
.mind-map-canvas__node--editing { }
```

### CSS Variables
Global CSS variables for consistent theming:

```css
:root {
  /* Colors */
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  
  /* Typography */
  --font-family: 'Inter', sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 3rem;
  
  /* Borders */
  --border-radius: 0.375rem;
  --border-width: 1px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

### Responsive Breakpoints
```css
/* Mobile first approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

## Testing Utilities

### Component Testing Helpers
```javascript
// test-utils.js
import { render } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';

const renderWithProviders = (component, options = {}) => {
  const Wrapper = ({ children }) => (
    <AuthProvider>
      {children}
    </AuthProvider>
  );

  return render(component, { wrapper: Wrapper, ...options });
};

export { renderWithProviders };
```

### Mock Data
```javascript
// mocks/mindMapData.js
export const mockMindMap = {
  _id: '507f1f77bcf86cd799439011',
  title: 'Test Mind Map',
  description: 'Test description',
  user_id: '507f1f77bcf86cd799439012',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z'
};

export const mockNode = {
  _id: '507f1f77bcf86cd799439013',
  text: 'Test Node',
  position: { x: 100, y: 200 },
  styling: { color: '#007bff', shape: 'rectangle' },
  mindmap_id: '507f1f77bcf86cd799439011'
};
```

---

*Last Updated: December 2024*
*Document Version: 1.0*
*Component Status: Core components defined, implementation in progress*
