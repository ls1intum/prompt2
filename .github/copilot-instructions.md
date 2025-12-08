# PROMPT 2.0 Copilot Instructions

## Architecture Overview

PROMPT is a **modular course management platform** with a **micro-frontend + microservice architecture**:

- **Core System**: Single `core` client (React + Webpack Module Federation) and `core` server (Go + Gin) that provides authentication, course management, and student administration
- **Course Phase Modules**: Independent frontend components and backend services (e.g., `interview_component`, `team_allocation_component`) that are dynamically loaded based on course configuration
- **Module Federation**: Course phase frontends are loaded remotely at runtime via Webpack Module Federation, enabling independent deployment and versioning

### Key Directories

```
clients/
  core/                    # Main React app, hosts remote modules
  shared_library/          # Shared UI components, hooks, network utilities
  *_component/             # Course phase micro-frontends (interview, matching, etc.)
  template_component/      # Boilerplate for new course phases
servers/
  core/                    # Main Go service (auth, courses, students)
  *_allocation/            # Course phase microservices
  template_server/         # Boilerplate for new phase services
```

## Development Workflows

### Running Locally

**Clients (all micro-frontends simultaneously):**

```bash
cd clients && yarn install && yarn run dev
```

**Core Server:**

```bash
cd servers/core && go run main.go
```

**Supporting Services (PostgreSQL, Keycloak):**

```bash
docker-compose up db keycloak
```

**Environment Configuration:**

- Copy `.env.template` to `.env` and adjust values
- Each microservice has separate DB configuration (e.g., `DB_CORE_*`, `DB_INTRO_COURSE_*`)
- Keycloak handles all authentication via `prompt-sdk`

### Testing

**Go Tests:**

```bash
# In any server directory
go test ./...
```

**Test Structure:**

- Tests use `testcontainers-go` for database isolation
- Database dumps in `database_dumps/*.sql` seed test data
- Pattern: `*_test.go` files with `testutils.SetupTestDB()`
- Example: `servers/intro_course/tutor/service_test.go`

## Client-Side Conventions

### Module Federation Setup

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

### Shared Library (`@/` imports)

All components import from `shared_library` using `@/` alias:

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

### Adding shadcn/ui Components

```bash
cd clients/shared_library
yarn dlx shadcn add <component-name>
```

Components are added to `shared_library/components/ui/` and available to all modules.

### State Management

- **React Query (@tanstack/react-query)**: Server state, caching
- **Zustand (@tumaet/prompt-shared-state)**: Global client state
- **React Router**: Navigation and routing

## Server-Side Conventions

### Database Access (sqlc)

All database queries use **sqlc** for type-safe SQL:

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

**Configuration:** `sqlc.yaml` in each server directory

### Database Migrations

Migrations use `golang-migrate`:

```bash
# Auto-run on server startup via runMigrations()
migrate -path ./db/migration -database $DATABASE_URL up
```

Migrations are in `db/migration/*.sql` (numbered sequentially).

### Module Structure Pattern

Each server module follows this pattern (example: `servers/core/course/`):

```
course/
  router.go           # Gin routes, auth middleware
  service.go          # Business logic
  courseDTO/          # Request/response DTOs
  service_test.go     # Tests
```

**Router Example:**

```go
func setupCourseRouter(router *gin.RouterGroup, authMiddleware, permissionMiddleware) {
    course := router.Group("/courses", authMiddleware())
    course.GET("/", permissionMiddleware(PromptAdmin, CourseLecturer), getAllCourses)
}
```

### Authentication & Authorization

All microservices use **prompt-sdk** for auth:

```go
import promptSDK "github.com/ls1intum/prompt-sdk"

// Initialize in main.go
promptSDK.InitAuthenticationMiddleware(keycloakURL, realm, coreURL)

// Use in routes
router.GET("/endpoint", authMiddleware(promptSDK.PromptAdmin, promptSDK.CourseLecturer), handler)
```

**Role Types:** `PromptAdmin`, `PromptLecturer`, `CourseLecturer`, `CourseEditor`, `CourseStudent`

### Environment Variables

All servers use `utils.GetEnv(key, defaultValue)` or `promptSDK.GetEnv()`:

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
7. Add to `docker-compose.yml` with dedicated database

## Common Patterns

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

### Logging

```go
import log "github.com/sirupsen/logrus"

log.Debug("Debug message")
log.Info("Info message")
log.Warn("Warning")
log.Error("Error occurred: ", err)
```

## Documentation

- **User/Admin Docs:** `docs/` (Docusaurus) - run with `yarn start`
- **API Docs:** Swagger annotations in Go code (`@Summary`, `@Tags`, etc.)
- **Live Instance:** <https://prompt.aet.cit.tum.de/>
