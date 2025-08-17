# TheBrain Motion & Spacing Patterns Guide

## Overview
This guide provides a detailed breakdown of TheBrain's signature motion and spacing patterns, focusing on their "Plex" visualization system and the smooth animated transitions that make their interface feel alive and responsive.

## 🎯 Core Animation Philosophy

TheBrain's interface is built around **"Smooth Responsive Animated Transitions"** with these principles:
- **Predictability**: Users can anticipate where nodes will move
- **Continuity**: Smooth transitions maintain mental model  
- **Hierarchy**: Animation emphasizes information relationships
- **Physics**: Natural movement that feels organic, not robotic
- **Performance**: Optimized for 60fps even with complex graphs

## 🎨 The Plex Layout System

### Standard Plex Organization
```
         [Parent Thoughts]
              ↑
[Sibling] ← [ACTIVE] → [Sibling]
              ↓
         [Child Thoughts]
```

### Spatial Hierarchy
```css
/* Node positioning and scaling */
.active-node {
  position: center;
  scale: 1.4;           /* 40% larger than normal */
  z-index: 100;
  opacity: 1.0;
}

.parent-nodes {
  position: top;
  distance: 120-180px;  /* From active node */
  scale: 1.0;
  opacity: 0.9;
}

.child-nodes {
  position: bottom;
  distance: 120-180px;
  scale: 1.0;
  opacity: 0.9;
}

.sibling-nodes {
  position: left-right;
  distance: 150-250px;
  scale: 1.0;
  opacity: 0.9;
}

.peripheral-nodes {
  position: edges;
  distance: 300-400px;
  scale: 0.7;           /* 30% smaller */
  opacity: 0.6;
}
```

## 🚀 Node Selection Animation Sequence

### Phase 1: Immediate Feedback (0-50ms)
```tsx
// Hover state - instant visual feedback
.node:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: all 100ms ease-out;
}
```

### Phase 2: State Transition (50-150ms)
```tsx
// Previous active node begins scaling down
const previousActiveTransition = {
  scale: 1.4 → 1.0,
  opacity: 1.0 → 0.9,
  duration: 100ms,
  easing: "ease-out"
}
```

### Phase 3: Layout Reorganization (150-450ms)
```tsx
// All nodes smoothly move to new positions
const layoutTransition = {
  duration: 400ms,
  easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", // ease-out
  stagger: 50ms // Nodes don't all move at once
}

// Movement patterns
const movementPhysics = {
  attraction: 0.3,      // Nodes attract to related nodes
  repulsion: 0.8,       // Nodes repel from unrelated nodes  
  centering: 0.5,       // Active node pulls toward center
  damping: 0.85         // Smooth motion dampening
}
```

### Phase 4: Content Loading (300-500ms)
```tsx
// Notes/content area updates with fade transition
const contentTransition = {
  fadeOut: 150ms,
  contentSwap: 0ms,
  fadeIn: 200ms,
  totalDuration: 350ms
}
```

## 🌊 Motion Characteristics

### Easing Functions
```css
/* Primary easing - feels natural and responsive */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
--ease-out-circ: cubic-bezier(0.08, 0.82, 0.17, 1);
--ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Spring-like movement for organic feel */
.node-transition {
  transition: all 400ms var(--ease-out-quart);
}

/* Slight overshoot for active nodes */
.node-activation {
  transition: all 300ms var(--ease-out-back);
}
```

### Movement Patterns
```
Ease-Out Pattern (most common):
Position: [Start] ████████████░░░░░░ [End]
Speed:    [Fast]  ████████░░░░░░░░░░ [Slow]
Time:     0ms     100ms    200ms    400ms

Spring Pattern (for active nodes):
Position: [Start] ████████████████▲░ [End]
          |       |               |   |
          |       Fast movement   |   Settle
          |                   Slight|
          Start               Overshoot
```

## 📐 Spacing Rules & Measurements

### Distance Calculations
```javascript
const spacingSystem = {
  // Base measurements (in pixels)
  baseNodeSize: 80,
  activeNodeSize: 112,      // 1.4x base
  minNodeDistance: 120,     // Prevents overlap
  maxConnectionDistance: 400,
  
  // Relationship-based spacing
  parentChildDistance: 150,
  siblingDistance: 200,
  jumpThoughtDistance: 180,
  
  // Layout boundaries
  plexPadding: 60,
  edgeBuffer: 40,
  
  // Responsive breakpoints
  mobile: {
    baseNodeSize: 60,
    minDistance: 80,
    parentChildDistance: 100
  },
  
  tablet: {
    baseNodeSize: 70,
    minDistance: 100,
    parentChildDistance: 125
  }
}
```

### Collision Detection & Avoidance
```javascript
// Prevents nodes from overlapping during transitions
const avoidOverlap = (nodes) => {
  const minDistance = 120;
  
  nodes.forEach((node, i) => {
    nodes.slice(i + 1).forEach(otherNode => {
      const distance = calculateDistance(node, otherNode);
      
      if (distance < minDistance) {
        // Apply repulsion force
        const repulsion = (minDistance - distance) / minDistance;
        applyForce(node, otherNode, repulsion * 0.5);
      }
    });
  });
}
```

## 🎮 Radiant Layout Physics

### Force-Directed Animation
```javascript
// TheBrain's "Radiant Layout" physics simulation
class RadiantLayout {
  constructor() {
    this.forces = {
      attraction: 0.3,      // Pull related nodes together
      repulsion: 0.8,       // Push unrelated nodes apart
      centering: 0.5,       // Active node gravitates to center
      damping: 0.85,        // Reduces oscillation
      collision: 1.2        // Prevents overlap
    };
    
    this.constraints = {
      minDistance: 120,
      maxDistance: 400,
      centerForce: 0.4,
      edgeRepulsion: 0.6
    };
  }
  
  update(nodes, activeNode, deltaTime) {
    nodes.forEach(node => {
      // Apply forces based on relationships
      const force = this.calculateForces(node, activeNode, nodes);
      
      // Update velocity with damping
      node.velocity.x = (node.velocity.x + force.x) * this.forces.damping;
      node.velocity.y = (node.velocity.y + force.y) * this.forces.damping;
      
      // Update position
      node.x += node.velocity.x * deltaTime;
      node.y += node.velocity.y * deltaTime;
    });
  }
}
```

### Visual Weight System
```css
/* Different node types have different visual weights */
.node-active {
  font-weight: 600;
  font-size: 16px;
  border-width: 3px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  z-index: 100;
}

.node-parent, .node-child {
  font-weight: 500;
  font-size: 14px;
  border-width: 2px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  z-index: 50;
}

.node-sibling {
  font-weight: 400;
  font-size: 14px;
  border-width: 1px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 25;
}

.node-peripheral {
  font-weight: 300;
  font-size: 12px;
  border-width: 1px;
  opacity: 0.6;
  z-index: 10;
}
```

## ⚡ Performance Optimization

### Hardware Acceleration
```css
/* Ensure smooth animations on all devices */
.brain-node {
  transform: translate3d(0, 0, 0); /* Enable GPU acceleration */
  will-change: transform, opacity;  /* Hint to browser */
  backface-visibility: hidden;      /* Prevent flickering */
}

/* Use transform instead of changing top/left for better performance */
.node-moving {
  transform: translate3d(var(--x), var(--y), 0) scale(var(--scale));
}
```

### Efficient Rendering
```javascript
// Only animate visible nodes
const optimizeAnimations = {
  viewport: getViewportBounds(),
  
  cullOffscreenNodes: (nodes) => {
    return nodes.filter(node => 
      isInViewport(node, viewport) || 
      node.isActive || 
      node.isConnectedToActive
    );
  },
  
  // Use requestAnimationFrame for smooth 60fps
  animationLoop: () => {
    const visibleNodes = cullOffscreenNodes(allNodes);
    updatePositions(visibleNodes);
    requestAnimationFrame(animationLoop);
  }
}
```

## 🎯 Implementation Examples

### React + Framer Motion
```tsx
import { motion, AnimatePresence } from 'framer-motion';

const BrainNode: React.FC<NodeProps> = ({ node, isActive, position }) => {
  const variants = {
    inactive: {
      scale: 0.8,
      opacity: 0.6,
      x: position.x,
      y: position.y,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4
      }
    },
    active: {
      scale: 1.4,
      opacity: 1.0,
      x: 0, // Center position
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        duration: 0.3
      }
    },
    related: {
      scale: 1.0,
      opacity: 0.9,
      x: position.x,
      y: position.y,
      transition: {
        type: "spring",
        stiffness: 350,
        damping: 28,
        duration: 0.4
      }
    }
  };

  return (
    <motion.div
      className={`brain-node ${node.type}`}
      variants={variants}
      initial="inactive"
      animate={isActive ? "active" : "related"}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      layoutId={node.id} // Smooth layout transitions
    >
      <motion.div 
        className="node-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {node.title}
      </motion.div>
    </motion.div>
  );
};
```

### CSS-Only Alternative
```css
/* Pure CSS implementation for lighter-weight version */
.brain-plex {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.brain-node {
  position: absolute;
  transition: all 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 8px;
  background: white;
  border: 2px solid #e2e8f0;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
}

.brain-node.active {
  transform: translate(-50%, -50%) scale(1.4);
  left: 50%;
  top: 50%;
  z-index: 100;
  border-color: #3b82f6;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.brain-node.parent {
  transform: translate(-50%, -100%);
  left: 50%;
  top: 30%;
}

.brain-node.child {
  transform: translate(-50%, 0);
  left: 50%;
  top: 70%;
}

.brain-node.sibling-left {
  transform: translate(-100%, -50%);
  left: 20%;
  top: 50%;
}

.brain-node.sibling-right {
  transform: translate(0, -50%);
  left: 80%;
  top: 50%;
}
```

### PIXI.js Implementation
```javascript
// High-performance canvas implementation
class BrainNodePIXI extends PIXI.Container {
  constructor(nodeData) {
    super();
    this.nodeData = nodeData;
    this.targetPosition = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.setupVisuals();
  }
  
  animateToPosition(targetX, targetY, duration = 400) {
    // Smooth easing animation
    const startX = this.x;
    const startY = this.y;
    const startTime = performance.now();
    
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic function
      const eased = 1 - Math.pow(1 - progress, 3);
      
      this.x = startX + (targetX - startX) * eased;
      this.y = startY + (targetY - startY) * eased;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }
  
  setActiveState(isActive) {
    const targetScale = isActive ? 1.4 : 1.0;
    const targetAlpha = isActive ? 1.0 : 0.9;
    
    // Animate scale and alpha
    this.animateProperty('scale.x', targetScale, 300);
    this.animateProperty('scale.y', targetScale, 300);
    this.animateProperty('alpha', targetAlpha, 300);
  }
}
```

## 📱 Responsive Adaptations

### Mobile Optimizations
```css
/* Smaller screens need adjusted spacing */
@media (max-width: 768px) {
  .brain-node {
    font-size: 12px;
    padding: 8px 12px;
    min-width: 60px;
  }
  
  .brain-node.active {
    transform: translate(-50%, -50%) scale(1.2); /* Less dramatic scaling */
  }
  
  .brain-node.parent,
  .brain-node.child {
    top: calc(50% ± 80px); /* Closer spacing */
  }
  
  .brain-node.sibling-left,
  .brain-node.sibling-right {
    left: calc(50% ± 100px); /* Closer to center */
  }
}

/* Touch-friendly interactions */
@media (pointer: coarse) {
  .brain-node {
    padding: 16px 20px; /* Larger touch targets */
    min-width: 80px;
    min-height: 60px;
  }
}
```

## 🎯 Key Timing Specifications

```javascript
const timingConstants = {
  // Interaction feedback
  hoverResponse: 100,        // ms - immediate feedback
  clickFeedback: 50,         // ms - tap acknowledgment
  
  // State transitions
  nodeActivation: 300,       // ms - becoming active
  nodeDeactivation: 200,     // ms - becoming inactive
  layoutReorganization: 400, // ms - full layout change
  
  // Content transitions  
  contentFadeOut: 150,       // ms - hide old content
  contentFadeIn: 200,        // ms - show new content
  
  // Physics simulation
  physicsStep: 16,           // ms - 60fps update rate
  dampingFactor: 0.85,       // velocity reduction per frame
  
  // Stagger effects
  nodeStagger: 50,           // ms - delay between node animations
  connectionStagger: 25,     // ms - delay between connection draws
  
  // Performance thresholds
  maxAnimationTime: 600,     // ms - longest allowed animation
  budgetPerFrame: 16,        // ms - maintain 60fps
}
```

This comprehensive motion and spacing system creates TheBrain's signature feel of an **intelligent, responsive interface** that guides users naturally through their knowledge networks while maintaining **visual clarity** and **predictable behavior**.