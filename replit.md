# AgentForge - AI-Powered Agent Platform

## Overview

AgentForge is a full-stack SaaS platform that enables users to build intelligent AI agents powered by website content. The platform features a public marketing website, authenticated dashboard, and AI-powered tools for creating chatbots, knowledge bases, and landing pages. Users can scan websites to automatically extract content, create AI agents with customizable personalities, and deploy chatbots for visitor engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server with HMR support
- Wouter for client-side routing (lightweight React Router alternative)
- TanStack Query (React Query) for server state management and API caching

**UI Component System**
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Design system follows "new-york" style with CSS variables for theming
- Custom color system supporting light/dark themes via CSS custom properties
- Typography: Inter for UI/body text, Space Grotesk for display/headlines

**State Management Strategy**
- React Query handles all server state with automatic caching and invalidation
- Local component state via React hooks for UI-only concerns
- No global state management library (Redux/Zustand) - server state kept in React Query cache

**Layout Structure**
- Marketing pages: Fixed navbar, full-width hero sections, footer
- Dashboard: Sidebar navigation (16rem width) with collapsible mobile drawer
- Responsive breakpoints: mobile-first approach with md/lg breakpoints

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- Node.js with ES modules (type: "module" in package.json)
- TypeScript throughout with path aliases (@shared, @/)

**Authentication System**
- Replit Auth (OpenID Connect) as the primary authentication provider
- Passport.js for authentication middleware
- Session-based authentication using express-session with PostgreSQL session store
- JWT tokens stored in user session with automatic refresh
- User claims extracted from OIDC tokens (email, name, profile image)

**API Design**
- RESTful endpoints under /api prefix
- All dashboard routes protected by isAuthenticated middleware
- Endpoints organized by resource: /api/agents, /api/knowledge, /api/conversations
- Request validation using Zod schemas (insertAgentSchema, updateAgentSchema)
- Error handling returns appropriate HTTP status codes with JSON error messages

**Data Access Layer**
- Storage interface pattern (IStorage) abstracting database operations
- All database queries go through storage.ts methods
- Promotes testability and potential database swapping

### Data Storage

**Database**
- PostgreSQL as the primary database
- Drizzle ORM for type-safe database queries and migrations
- Schema-first approach with drizzle-zod for runtime validation

**Schema Design**
- **users**: Core user table with OIDC user ID as primary key
- **agents**: AI agents belong to users (userId foreign key with cascade delete)
- **knowledgeBase**: Content entries linked to agents (agentId foreign key)
- **conversations**: Chat sessions linked to agents
- **messages**: Individual chat messages within conversations
- **generatedPages**: Landing pages created by agents
- **sessions**: PostgreSQL session store for express-session

**Data Relationships**
- One-to-many: User → Agents
- One-to-many: Agent → Knowledge Base entries
- One-to-many: Agent → Conversations
- One-to-many: Conversation → Messages
- One-to-many: Agent → Generated Pages

### External Dependencies

**AI Services**
- Anthropic Claude SDK (@anthropic-ai/sdk) for AI agent functionality
- Package includes OpenAI SDK suggesting potential multi-provider support

**Email Services**
- Nodemailer configured for transactional emails (verification, password reset)

**Payment Processing**
- Stripe SDK integrated for subscription management and payments

**Session Management**
- connect-pg-simple for PostgreSQL-backed session storage
- Prevents session loss on server restart

**Development Tools**
- Replit-specific plugins: vite-plugin-cartographer, vite-plugin-dev-banner
- Runtime error overlay for development debugging

**Build Process**
- Custom build script (script/build.ts) using esbuild for server bundling
- Selective dependency bundling via allowlist to reduce syscalls
- Vite handles client build with output to dist/public
- Production deployment uses bundled CommonJS output (dist/index.cjs)

**File Upload**
- Multer middleware for handling multipart/form-data (knowledge base uploads)

**Data Processing**
- XLSX library for spreadsheet processing
- Axios for HTTP requests (likely for website scanning)