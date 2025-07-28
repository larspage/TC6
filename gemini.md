# Gemini Project: ThoughtCatcher6

This document provides a comprehensive overview of the ThoughtCatcher6 project for Gemini, summarizing key information from the `Docs` and `.cursor/memory-bank` folders.

## 1. Project Overview

ThoughtCatcher6 is an AI-enhanced mind mapping application designed to provide users with an intuitive, powerful, and intelligent platform for organizing thoughts, brainstorming ideas, and visualizing information. The project is built on the MERN stack (MongoDB, Express.js, React, Node.js).

- **Problem Statement**: Current mind mapping tools suffer from poor auto-layout systems, limited AI integration, insufficient collaboration features, and poor export capabilities that don't preserve structure.
- **Goal**: To leverage Artificial Intelligence to transform chaotic ideas into structured plans, enhance productivity, creativity, and collaboration.
- **Target Audience**: Individuals for personal use, business professionals, educators, students, designers, creatives, engineers, software development teams, negotiators, mediators, and users with learning differences.

## 2. Architecture

The system consists of a React client, an Express API server, and a MongoDB database.

- **Frontend**: React 18+ with Hooks, SVG for canvas rendering, and local storage for offline capabilities.
- **Backend**: Node.js with Express.js, Mongoose for MongoDB interaction, and JWT for authentication.
- **Database**: MongoDB for document storage.

### Data Models

- **MindMap**: Stores the main mind map data, including title, description, user ID, and canvas settings.
- **Node**: Represents individual nodes in a mind map, containing text, position, styling, and parent/mind map references.
- **Connection**: Defines the links between nodes, including source and target nodes, and styling information.
- **User**: Manages user accounts, including authentication details and personal information.

## 3. API Reference

The API is designed following RESTful principles and uses JWT for authentication.

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: Bearer Token (JWT)

### Key Endpoints:

- **Authentication**: `/auth/register`, `/auth/login`, `/auth/forgot-password`
- **Mind Maps**: CRUD operations on `/mindmaps`
- **Nodes**: CRUD operations on `/nodes`
- **Connections**: CRUD operations on `/connections`
- **Export**: `/mindmaps/:id/export/png`, `/mindmaps/:id/export/json`

## 4. Component Library

The frontend is built with a modular component library, including:

- **Canvas Components**: `Canvas`, `Node`, `Connection` for the mind mapping interface.
- **UI Components**: Reusable components like `Button`, `Modal`, and `ColorPicker`.
- **Form Components**: `Input`, `TextArea` for user input.
- **Layout Components**: `Header`, `Sidebar`, `Toolbar` for application structure.
- **Page Components**: `DashboardPage`, `EditorPage`, `LoginPage`.

## 5. Development Guidelines

- **Code Style**: Functional components with hooks, PascalCase for components, kebab-case for files, and camelCase for variables/functions.
- **File Organization**: A structured directory layout for components, hooks, services, and styles.
- **API Development**: Express routes with validation and standardized error handling.
- **Testing**: Unit tests with Jest and React Testing Library, and API tests with Supertest.
- **Git Workflow**: Feature branching (`feature/feature-name`), conventional commit messages, and pull request templates.

## 6. Task Breakdown

The project is divided into several phases, with the current focus on Phase 1.

- **Phase 1: Foundation & Infrastructure (In Progress)**: Project setup, database architecture, and API foundation.
- **Phase 2: MVP Core Features (Not Started)**: Canvas workspace, node management, and hierarchical relationships.
- **Phase 3: Data Persistence & User Management (Not Started)**: Auto-save system, mind map library, and user authentication.
- **Phase 4: Sharing & Collaboration (Not Started)**: Basic sharing system and export functionality.
- **Phase 5: Advanced Features (Post-MVP)**: Advanced layout, rich content support, and AI integration.
- **Phase 6: Collaboration Enhancement (Post-MVP)**: Real-time collaboration and advanced features.

### MVP Features:

-   Core mind map creation and editing (central topic, nodes, branches, text).
-   Drag-and-drop functionality.
-   Basic customization (colors, text formatting).
-   Manual connection drawing.
-   Cloud storage with automatic saving and loading.
-   Basic sharing (view-only) and export (PNG, JPEG, text outline).
-   Intuitive user interface.

### Post-MVP Features:

-   Advanced auto-layout and design.
-   Comprehensive AI enhancements (idea generation, auto-expansion, content recommendations, smart formatting, voice/text input, summarization).
-   Enhanced collaboration (real-time co-editing, commenting, voting, live discussion, granular permissions).
-   Advanced information management (grouping, sub-maps, rich node attachments, multiple diagram types).
-   Comprehensive import/export (structured documents, various formats).
-   Integrations with project management tools, communication platforms, and design tools.
-   Optional project management features (task dependencies, assignments, workflow visualization).
-   Version control and history.
-   Presentation mode.