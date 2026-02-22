# PROMPT 2.0 - AI Assistant Guide

This document provides essential context for AI assistants working on the PROMPT 2.0 codebase.

## Project Overview

**PROMPT 2.0** is a modular course management platform for project-based university teaching, originally developed for the iPraktikum at TU Munich. It uses a **micro-frontend + microservices architecture** with:

- **Core System**: React frontend (Webpack Module Federation) + Go backend (Gin framework)
- **Course Phase Modules**: Independent frontend components and backend services dynamically loaded based on course configuration
- **Authentication**: Keycloak for identity management with RBAC

**Live Instance:** <https://prompt.aet.cit.tum.de/>

## Repository Structure

```text
clients/
  core/                    # Main React app shell (port 3000)
  shared_library/          # Shared UI components, hooks, network utilities
  *_component/             # Course phase micro-frontends:
    - interview_component (port 3002)
    - matching_component (port 3003)
    - template_component (port 3001)
    - team_allocation_component (port 3008)
    - self_team_allocation_component (port 3009)
    - assessment_component (port 3007)
    - intro_course_developer_component (port 3005)
    - devops_challenge_component (port 3006)

servers/
  core/                    # Main Go service (port 8080)
  interview/               # Interview scheduling (port 8087)
  team_allocation/         # Team matching (port 8083)
  self_team_allocation/    # Self-managed teams (port 8084)
  assessment/              # Rubric-based grading (port 8085)
  intro_course/            # Intro programming course (port 8082)
  template_server/         # Course templates (port 8086)

docs/                      # Docusaurus documentation
```

## Quick Start Commands

Use the Makefile for cross-shell compatible commands:

```bash
# Start all micro-frontends
make clients

# Start core server (loads .env and .env.dev automatically)
make server

# Start database and Keycloak (detached)
make db

# Stop database and Keycloak
make db-down

# Run linting
make lint

# Run tests
make test
```

**Environment Setup:** Copy `.env.template` to `.env` and `.env.dev.template` to `.env.dev`. The `.env.dev` file contains localhost overrides for local development (vs Docker hostnames in `.env`). Each microservice has separate DB configuration (e.g., `DB_CORE_*`, `DB_INTRO_COURSE_*`).

## Technology Stack

### Frontend

- React 19, TypeScript 5.9, Webpack 5 (Module Federation)
- Tailwind CSS v4, shadcn/ui + Radix UI
- Zustand (state), TanStack React Query (data fetching)
- React Hook Form, Axios, React Router DOM 7

### Backend

- Go 1.26, Gin framework
- PostgreSQL with pgx driver
- sqlc for type-safe SQL generation
- golang-migrate for migrations

## Code Conventions

### Client-Side

**Naming:**

- PascalCase: React components, component folders (e.g., `ApplicationAssessmentPage`)
- camelCase: non-component folders, functions, variables
- SCREAMING_SNAKE_CASE: constants

**Types:**

- Prefer `interface` over `type` for structures
- Never use `any` - enforce strict typing
- Place type definitions at the beginning of files

**Imports from shared_library use `@/` alias:**

```typescript
import { Button } from "@/components/ui/button"; // shadcn/ui components
import { useGetCoursePhase } from "@/hooks/useGetCoursePhase";
import { getCoursePhase } from "@/network/queries/getCoursePhase";
import { CoursePhase } from "@/interfaces/coursePhase";
```

**Key Shared Resources:**

- `@/components/ui/*` - shadcn/ui design system (Tailwind CSS)
- `@/hooks/*` - React Query hooks for data fetching
- `@/network/*` - Axios API calls
- `@/interfaces/*` - TypeScript interfaces
- `@/contexts/*` - React context providers

**Adding shadcn/ui Components:**

```bash
cd clients/shared_library
yarn dlx shadcn add <component-name>
```

Components are added to `shared_library/components/ui/` and available to all modules.

**State Management:**

- **React Query (@tanstack/react-query)**: Server state, caching
- **Zustand (@tumaet/prompt-shared-state)**: Global client state
- **React Router**: Navigation and routing

**Folder structure per component:**

```text
components/   # Sub-components
hooks/
interfaces/
pages/        # Top level only
utils/
zustand/
```

### Server-Side

**Naming:**

- PascalCase: Exported types/functions (e.g., `CourseService`, `CreateCourse`)
- camelCase: Unexported functions, local variables
- snake_case: Database columns and tables

**Module structure:**

```text
module/
  moduleDTO/        # Request/response DTOs
  router.go         # Gin routes, auth middleware
  service.go        # Business logic
  service_test.go   # Tests
  validation.go     # Input validation
```

**Database access with sqlc:**

1. Write SQL in `db/query/*.sql`:

   ```sql
   -- name: GetTutors :many
   SELECT * FROM tutors WHERE course_phase_id = $1;
   ```

2. Generate Go code:

   ```bash
   sqlc generate
   ```

3. Use generated methods:

   ```go
   import db "github.com/ls1intum/prompt2/servers/core/db/sqlc"

   tutors, err := queries.GetTutors(ctx, coursePhaseID)
   ```

**Configuration:** `sqlc.yaml` in each server directory.

**Database Migrations:**

Migrations use `golang-migrate`:

```bash
# Auto-run on server startup via runMigrations()
migrate -path ./db/migration -database $DATABASE_URL up
```

Migrations are in `db/migration/*.sql` (numbered sequentially).

**Authentication with prompt-sdk:**

```go
import promptSDK "github.com/ls1intum/prompt-sdk"

// Initialize in main.go
promptSDK.InitAuthenticationMiddleware(keycloakURL, realm, coreURL)

// Use in routes
router.GET("/endpoint", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), handler)
```

**Roles:** `PromptAdmin`, `PromptLecturer`, `CourseLecturer`, `CourseEditor`, `CourseStudent`

**Logging:**

```go
import log "github.com/sirupsen/logrus"

log.Debug("Debug message")
log.Info("Info message")
log.Warn("Warning")
log.Error("Error occurred: ", err)
```

## Key Patterns

### Module Federation (Frontend)

**Exporting a Component** (`<component>/webpack.config.ts`):

```typescript
new ModuleFederationPlugin({
  name: "your_component",
  filename: "remoteEntry.js",
  exposes: {
    "./App": "./src/App",
    "./sidebar": "./src/Sidebar", // For management console integration
  },
});
```

**Importing in Core** (`core/webpack.config.ts`):

```typescript
remotes: {
  your_component: `your_component@${yourComponentURL}/remoteEntry.js?${Date.now()}`
}
```

**Loading Dynamically:**

```typescript
const YourComponent = React.lazy(() => import("your_component/App"));
```

### API Calls (Frontend)

```typescript
// In shared_library/network/queries/
export const getCoursePhase = async (id: string): Promise<CoursePhase> => {
  const response = await axios.get(`/api/course_phases/${id}`);
  return response.data;
};

// In component
const { data, isLoading } = useQuery({
  queryKey: ["coursePhase", id],
  queryFn: () => getCoursePhase(id),
});
```

### Error Handling (Backend)

```go
func handler(c *gin.Context) {
    id, err := uuid.Parse(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    // ... business logic
}
```

### Environment Variables

```go
dbHost := utils.GetEnv("DB_HOST", "localhost")
serverAddress := utils.GetEnv("SERVER_ADDRESS", "localhost:8080")
```

**Critical Variables:**

- `DB_*` - Database connection (per-service)
- `KEYCLOAK_*` - Authentication configuration
- `CORE_HOST` - Frontend URL for CORS
- `SERVER_CORE_HOST` - Core service URL for inter-service calls
- `DEBUG` - Enable debug logging

## Creating New Course Phases

### Frontend Component

1. Copy `clients/template_component/` to `clients/your_component/`
2. Update `webpack.config.ts` with unique port and component name
3. Add to `clients/lerna.json` packages array
4. Add to `clients/package.json` workspaces
5. Register in `core/webpack.config.ts` remotes
6. Import in core with `React.lazy()`

### Backend Service

1. Copy `servers/template_server/` to `servers/your_service/`
2. Update `go.mod` module path
3. Define database schema in `db/migration/*.sql`
4. Write queries in `db/query/*.sql`, run `sqlc generate`
5. Implement business logic in `<module>/service.go`
6. Set up routes in `<module>/router.go`
7. Add to `docker-compose.yml` with dedicated database (uses `docker compose` v2)

## Testing

**Go Tests:**

```bash
cd servers/<service> && go test ./...
```

- Tests use `testcontainers-go` for database isolation
- Database dumps in `database_dumps/*.sql` seed test data
- Pattern: `*_test.go` files with `testutils.SetupTestDB()`

## UI Guidelines

- Student main pages: Place key actions directly, avoid subpage navigation
- Lecturer main pages: State purpose, show status summary with progress indicators
- Recommended subpages: Participants, Student Preview, Mailing (optional), Configuration

## Documentation

- **User/Admin Docs:** `docs/` (Docusaurus) - run with `yarn start`
- **API Docs:** Swagger annotations in Go code (`@Summary`, `@Tags`, etc.)
- **Setup Guide:** `docs/contributor/setup.md`
- **Client Guide:** `docs/contributor/guide/client.md`
- **Server Guide:** `docs/contributor/guide/server.md`

## Important Notes

- All microservices use separate PostgreSQL databases
- Routes must be under `<server>/api/course_phase/:coursePhaseID` for SDK auth
- Use `yarn dlx shadcn add <component>` in shared_library for new UI components
- Course-specific roles are dynamically created with naming convention including semester and course name
