# LpKards

## Overview

LpKards is a medical education flashcard generator that uses AI to create Anki-style cloze deletion flashcards from medical text. Users paste medical content, select a study mode (conceptual, clinical, or board prep), difficulty level (basic, intern, resident), and desired quantity. The app generates flashcards using OpenAI's GPT model, displays them in an interactive flip-card grid, and allows export for Anki import.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom medical/professional color palette
- **UI Components**: shadcn/ui (Radix UI primitives) with New York style variant
- **Animations**: Framer Motion for card flip animations
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: REST endpoints defined in shared/routes.ts with Zod validation
- **Build**: esbuild for production bundling with selective dependency bundling

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: shared/schema.ts (shared between frontend and backend)
- **Migrations**: drizzle-kit with migrations stored in /migrations
- **Session Storage**: connect-pg-simple for session management

### AI Integration
- **Provider**: OpenAI via Replit AI Integrations
- **Models Used**: gpt-5.1 for text generation, gpt-image-1 for image generation
- **Configuration**: Environment variables AI_INTEGRATIONS_OPENAI_API_KEY and AI_INTEGRATIONS_OPENAI_BASE_URL
- **Batch Processing**: Built-in utilities for rate limiting and retries (server/replit_integrations/batch/)

### Key Design Patterns
1. **Shared Types**: Schema definitions in /shared are used by both client and server
2. **Type-Safe API**: Routes defined with Zod schemas for input validation and response typing
3. **Component Architecture**: Feature components in /client/src/components, pages in /client/src/pages
4. **Storage Abstraction**: IStorage interface in server/storage.ts for database operations

### Directory Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components (including shadcn/ui)
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities (queryClient, utils)
│       └── pages/        # Route pages
├── server/           # Express backend
│   ├── services/         # Business logic (flashcard_generator)
│   └── replit_integrations/  # AI integration modules
├── shared/           # Shared types and schemas
│   ├── schema.ts         # Drizzle schema definitions
│   ├── routes.ts         # API route definitions
│   └── models/           # Additional model definitions
└── migrations/       # Database migrations
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database via DATABASE_URL environment variable
- **Drizzle ORM**: Schema management and queries

### AI Services
- **OpenAI API**: Accessed through Replit AI Integrations
  - Text completion for flashcard generation
  - Image generation capabilities
  - Chat functionality with conversation persistence

### Frontend Libraries
- **Radix UI**: Accessible component primitives
- **TanStack Query**: Data fetching and caching
- **file-saver**: Export flashcards to files
- **Framer Motion**: Animations

### Development Tools
- **Vite**: Development server with HMR
- **Replit Plugins**: Runtime error overlay, cartographer, dev banner