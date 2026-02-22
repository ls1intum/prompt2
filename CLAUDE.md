# CLAUDE.md - AI Assistant Guide for PROMPT 2.0

This document provides essential context for AI assistants working on the PROMPT 2.0 codebase.

## Project Overview

**PROMPT 2.0** is a modular course management platform for project-based university teaching, originally developed for the iPraktikum at TU Munich. It uses a **micro-frontend + microservices architecture** with:

- **Core System**: React frontend (Webpack Module Federation) + Go backend (Gin framework)
- **Course Phase Modules**: Independent frontend components and backend services dynamically loaded based on course configuration
- **Authentication**: Keycloak for identity management with RBAC

## Repository Structure

```
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
    - intro_course_tutor_component (port 3004)

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

```bash
# Frontend - all micro-frontends simultaneously
cd clients && yarn install && yarn run dev

# Backend - core server
cd servers/core && go run main.go

# Supporting services (PostgreSQL, Keycloak)
docker-compose up db keycloak
```

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

**Imports from shared_library use `@/` alias:**
```typescript
import { Button } from "@/components/ui/button";
import { useGetCoursePhase } from "@/hooks/useGetCoursePhase";
import { getCoursePhase } from "@/network/queries/getCoursePhase";
```

**Types:**
- Prefer `interface` over `type` for structures
- Never use `any` - enforce strict typing
- Place type definitions at the beginning of files

**Folder structure per component:**
```
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
```
module/
  moduleDTO/        # Request/response DTOs
  router.go         # Gin routes, auth middleware
  service.go        # Business logic
  service_test.go   # Tests
  validation.go     # Input validation
```

**Database access with sqlc:**
```sql
-- In db/query/*.sql
-- name: GetTutors :many
SELECT * FROM tutors WHERE course_phase_id = $1;
```
Then run `sqlc generate` to create type-safe Go code.

**Authentication with prompt-sdk:**
```go
import promptSDK "github.com/ls1intum/prompt-sdk"

// In routes - use SDK roles
router.GET("/endpoint", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), handler)
```

**Roles:** `PromptAdmin`, `PromptLecturer`, `CourseLecturer`, `CourseEditor`, `CourseStudent`

## Key Patterns

### Module Federation (Frontend)

Components export via webpack:
```typescript
// component/webpack.config.ts
new ModuleFederationPlugin({
  name: "your_component",
  filename: "remoteEntry.js",
  exposes: { "./App": "./src/App" },
});
```

Core imports dynamically:
```typescript
const YourComponent = React.lazy(() => import("your_component/App"));
```

### API Calls (Frontend)
```typescript
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
}
```

### Environment Variables
```go
dbHost := utils.GetEnv("DB_HOST", "localhost")
```

Critical vars: `DB_*`, `KEYCLOAK_*`, `CORE_HOST`, `SERVER_CORE_HOST`, `DEBUG`

## Creating New Course Phases

### Frontend Component
1. Copy `clients/template_component/` to `clients/your_component/`
2. Update `webpack.config.ts` with unique port and name
3. Add to `clients/lerna.json` packages array
4. Add to `clients/package.json` workspaces
5. Register in `core/webpack.config.ts` remotes

### Backend Service
1. Copy `servers/template_server/` to `servers/your_service/`
2. Update `go.mod` module path
3. Define schema in `db/migration/*.sql`
4. Write queries in `db/query/*.sql`, run `sqlc generate`
5. Implement logic in `service.go`, routes in `router.go`
6. Add to `docker-compose.yml`

## Testing

**Go Tests:**
```bash
cd servers/<service> && go test ./...
```
- Tests use `testcontainers-go` for database isolation
- Pattern: `*_test.go` files with `testutils.SetupTestDB()`

## UI Guidelines

- Student main pages: Place key actions directly, avoid subpage navigation
- Lecturer main pages: State purpose, show status summary with progress indicators
- Recommended subpages: Participants, Student Preview, Mailing (optional), Configuration

## Documentation

- User/Admin docs: `docs/` (Docusaurus)
- API docs: Swagger annotations in Go code
- Setup guide: `docs/contributor/setup.md`
- Client guide: `docs/contributor/guide/client.md`
- Server guide: `docs/contributor/guide/server.md`

## Important Notes

- All microservices use separate PostgreSQL databases
- Routes must be under `<server>/api/course_phase/:coursePhaseID` for SDK auth
- Use `yarn dlx shadcn add <component>` in shared_library for new UI components
- Course-specific roles are dynamically created with naming convention including semester and course name
