# Plan: Extract Intro Course into a Separate GitHub Repository

## Executive Summary

Extract `servers/intro_course/` and `clients/intro_course_developer_component/` from the `prompt2` monorepo into a new standalone GitHub repository (e.g., `ls1intum/prompt2-intro-course`). The extracted services will continue to run on the same VM, joining the existing `prompt-network` Docker network and being routed by the existing Traefik reverse proxy.

---

## Current State

### Components to Extract

| Component              | Location                                    | Port            | Docker Image                                                               |
| ---------------------- | ------------------------------------------- | --------------- | -------------------------------------------------------------------------- |
| **Server**             | `servers/intro_course/`                     | 8080 (internal) | `ghcr.io/ls1intum/prompt2/prompt-server-intro-course`                      |
| **Client (Developer)** | `clients/intro_course_developer_component/` | 80 (nginx)      | `ghcr.io/ls1intum/prompt2/prompt-clients-intro-course-developer-component` |
| **Database**           | `db-intro-course` (postgres:15.2-alpine)    | 5433            | Stock postgres image                                                       |

### Integration Points with Monorepo

| Integration                    | Direction                        | Mechanism                                                                                           |
| ------------------------------ | -------------------------------- | --------------------------------------------------------------------------------------------------- |
| Phase type registration        | Core server → DB                 | `initIntroCourseDeveloper()` writes URL `{CORE_HOST}/intro-course/api` to `course_phase_type` table |
| Module Federation              | Core client → Intro client       | Webpack remote at `/intro-course-developer/remoteEntry.js` via Traefik                              |
| Sidebar/route/detail mappings  | Core client code                 | `PhaseSidebarMapping.tsx`, `PhaseRouterMapping.tsx`, `PhaseStudentDetailMapping.tsx`                |
| Shared library (`@/`)          | Intro client → `shared_library/` | Webpack alias, Yarn workspaces, base Docker image                                                   |
| `@tumaet/prompt-shared-state`  | Intro client → npm               | Published npm package (no issue)                                                                    |
| `@tumaet/prompt-ui-components` | Intro client → npm               | Published npm package (no issue)                                                                    |
| `prompt-sdk` (Go)              | Intro server → Go module         | Published at `github.com/ls1intum/prompt-sdk` (no issue)                                            |
| Core server calls              | Intro server → Core server       | `PUT /api/keycloak/:courseID/group/:name/students` (via `SERVER_CORE_HOST`)                         |
| Docker network                 | All containers                   | `prompt-network` (external Docker network)                                                          |
| Traefik routing                | Reverse proxy → containers       | Labels: `PathPrefix(/intro-course/api)` and `PathPrefix(/intro-course-developer)`                   |

---

## Phase 1: Prepare the `shared_library` Dependency

**Problem:** The intro course client imports ~15 modules from `shared_library` via the `@/` alias. This library is monorepo-local (`private: true`, not published).

### Option A: Publish `shared_library` as an npm package (Recommended)

1. **Rename and scope** `shared_library` → `@tumaet/prompt-shared-library` (or similar)
2. Set up npm publishing in CI (GitHub Packages or npmjs.com)
3. Update all monorepo clients to import from the package instead of the workspace alias
4. The extracted intro course repo adds it as a normal dependency

**Pros:** Clean separation, versioned, any future external module can depend on it.
**Cons:** Requires changes across all existing components, versioning overhead.

### Option B: Continue using the monorepo base Docker image

1. The extracted client Dockerfile continues to `FROM ghcr.io/ls1intum/prompt2/prompt-clients-base:${IMAGE_TAG}`
2. It pulls the base image from the monorepo's GHCR, which already contains `shared_library`
3. No changes to the shared library itself

**Pros:** Minimal initial effort, no changes to other components.
**Cons:** Cross-repo image dependency (the extracted repo's build depends on the monorepo publishing the base image first), version coupling.

### Option C: Vendor `shared_library` into the new repo

1. Copy `shared_library/` into the new repo
2. Maintain it as a local dependency within the new repo
3. Manually sync changes from the monorepo when needed

**Pros:** Full independence, no cross-repo build dependencies.
**Cons:** Code duplication, drift risk, maintenance burden.

**Recommendation:** Start with **Option B** for immediate extraction, then migrate to **Option A** over time.

---

## Phase 2: Create the New Repository

### 2.1 Repository Structure

```
prompt2-intro-course/
├── .github/
│   └── workflows/
│       ├── dev.yml                    # PR/push pipeline
│       ├── prod.yml                   # Release pipeline
│       ├── build-and-push.yml         # Build server + client images
│       └── deploy.yml                 # SSH deploy to VM
├── clients/
│   └── intro_course_developer_component/
│       ├── Dockerfile
│       ├── package.json
│       ├── webpack.config.ts
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       ├── eslint.config.mjs
│       ├── routes/
│       ├── sidebar/
│       └── src/
├── servers/
│   └── intro_course/
│       ├── Dockerfile                 # Copy from servers/Dockerfile
│       ├── main.go
│       ├── go.mod
│       ├── go.sum
│       ├── sqlc.yaml
│       ├── config/
│       ├── copy/
│       ├── coreRequests/
│       ├── db/
│       ├── developerProfile/
│       ├── infrastructureSetup/
│       ├── seatPlan/
│       ├── testutils/
│       ├── tutor/
│       └── utils/
├── docker-compose.yml                 # Local development
├── docker-compose.prod.yml            # Production deployment
├── .env.template
└── README.md
```

### 2.2 Copy Source Code

```bash
# Server
cp -r servers/intro_course/ <new-repo>/servers/intro_course/
cp servers/Dockerfile <new-repo>/servers/intro_course/Dockerfile

# Client
cp -r clients/intro_course_developer_component/ <new-repo>/clients/intro_course_developer_component/

# Nginx config (needed for client Docker build)
cp -r clients/nginx/ <new-repo>/clients/nginx/
```

### 2.3 Preserve Git History (Optional)

Use `git filter-repo` to extract history for the relevant directories:

```bash
git clone prompt2 prompt2-intro-course
cd prompt2-intro-course
git filter-repo \
  --path servers/intro_course/ \
  --path clients/intro_course_developer_component/ \
  --path clients/nginx/
```

---

## Phase 3: Adapt the Extracted Server

### 3.1 Server — No Major Changes Needed

The Go server is already self-contained:

- Own `go.mod` with independent dependencies
- `prompt-sdk` is an external Go module (`github.com/ls1intum/prompt-sdk`)
- Own database schema and migrations
- Only external call: `SERVER_CORE_HOST` for Keycloak group management

**No code changes required.** Only the Dockerfile path needs adjustment (see Phase 5).

### 3.2 Adjust Go Module Path (Optional)

If you want the module path to reflect the new repo:

```go
// go.mod
module github.com/ls1intum/prompt2-intro-course/servers/intro_course
```

This requires updating all internal imports in the server code. Alternatively, keep the original module path — it's just a module identifier, not a hard requirement to match the repo URL.

---

## Phase 4: Adapt the Extracted Client

### 4.1 Handle `shared_library` Dependency

**If using Option B (base image):**

The Dockerfile stays almost identical:

```dockerfile
ARG IMAGE_TAG
FROM ghcr.io/ls1intum/prompt2/prompt-clients-base:${IMAGE_TAG} AS core-base

WORKDIR /app/intro_course_developer_component
COPY . ./
RUN yarn install
RUN yarn build

FROM nginx:stable-alpine
COPY --from=core-base /app/intro_course_developer_component/build /usr/share/nginx/html
COPY --from=core-base /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

The `IMAGE_TAG` must track a valid tag from the monorepo's `prompt-clients-base` image.

**If using Option A (published shared_library):**

1. Remove the `@/` webpack alias for `shared_library`
2. Add `@tumaet/prompt-shared-library` to `package.json`
3. Update all `@/` imports to `@tumaet/prompt-shared-library/...`
4. Create a standalone Dockerfile that doesn't need the base image:

```dockerfile
FROM node:23.11 AS builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . ./
RUN yarn build

FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 4.2 Webpack Config

No changes needed for Module Federation — the component name `intro_course_developer_component` and exposed modules (`./routes`, `./sidebar`, `./provide`) must stay identical. The core app loads these by name.

### 4.3 Network Config

The Axios base URL (`env.INTRO_COURSE_HOST`) is already runtime-configurable via `env.js` in the core client. No client code changes needed.

---

## Phase 5: Production Docker Compose

### 5.1 New Repo's `docker-compose.prod.yml`

```yaml
services:
  server-intro-course:
    image: ghcr.io/ls1intum/prompt2-intro-course/prompt-server-intro-course:${SERVER_IMAGE_TAG}
    container_name: server-intro-course
    restart: unless-stopped
    networks:
      - prompt-network
    depends_on:
      db-intro-course:
        condition: service_healthy
    environment:
      - SERVER_ADDRESS=0.0.0.0:8080
      - CORE_HOST=${CORE_HOST}
      - SERVER_CORE_HOST=${SERVER_CORE_HOST}
      - DB_HOST=db-intro-course
      - DB_PORT=5432
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - KEYCLOAK_HOST=${KEYCLOAK_HOST}
      - KEYCLOAK_REALM_NAME=${KEYCLOAK_REALM_NAME}
      - KEYCLOAK_AUTHORIZED_PARTY=${KEYCLOAK_AUTHORIZED_PARTY}
      - KEYCLOAK_CLIENT_ID=${KEYCLOAK_CLIENT_ID}
      - GITLAB_ACCESS_TOKEN=${GITLAB_ACCESS_TOKEN}
      - SENTRY_DSN=${SENTRY_DSN}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.intro-course-api.rule=Host(`${CORE_HOST}`) && PathPrefix(`/intro-course/api`)"
      - "traefik.http.routers.intro-course-api.entrypoints=websecure"
      - "traefik.http.routers.intro-course-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.intro-course-api.loadbalancer.server.port=8080"
      - "traefik.http.routers.intro-course-api.middlewares=rate-limit@docker"
      - "traefik.docker.network=prompt-network"

  client-intro-course-developer-component:
    image: ghcr.io/ls1intum/prompt2-intro-course/prompt-clients-intro-course-developer:${CLIENT_IMAGE_TAG}
    container_name: client-intro-course-developer-component
    restart: unless-stopped
    networks:
      - prompt-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.intro-course-developer.rule=Host(`${CORE_HOST}`) && PathPrefix(`/intro-course-developer`)"
      - "traefik.http.routers.intro-course-developer.entrypoints=websecure"
      - "traefik.http.routers.intro-course-developer.tls.certresolver=letsencrypt"
      - "traefik.http.middlewares.intro-course-developer-strip.stripprefix.prefixes=/intro-course-developer"
      - "traefik.http.routers.intro-course-developer.middlewares=intro-course-developer-strip@docker,compress@docker"
      - "traefik.http.services.intro-course-developer.loadbalancer.server.port=80"
      - "traefik.docker.network=prompt-network"

  db-intro-course:
    image: postgres:15.2-alpine
    container_name: db-intro-course
    restart: unless-stopped
    networks:
      - prompt-network
    volumes:
      - intro-course-db-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  intro-course-db-data:

networks:
  prompt-network:
    name: prompt-network
    external: true
```

### 5.2 Key Networking Details

- **`prompt-network` must already exist** — it's created by the main `docker-compose.prod.yml` or manually via `docker network create prompt-network`
- **Traefik discovers the containers** via Docker labels — as long as they're on `prompt-network` and have `traefik.enable=true`, routing works automatically
- **No changes to Traefik config** needed — it auto-discovers services on the network
- **Service names remain the same** so Traefik rules and cross-service DNS resolution continue to work

---

## Phase 6: CI/CD for the New Repository

### 6.1 Build & Push Workflow

Create `.github/workflows/build-and-push.yml`:

```yaml
name: Build and Push

on:
  workflow_call:
    inputs:
      release_tag:
        type: string
        required: false
    outputs:
      server_image_tag:
        value: ${{ jobs.server.outputs.image_tag }}
      client_image_tag:
        value: ${{ jobs.client.outputs.image_tag }}

jobs:
  server:
    uses: ls1intum/.github/.github/workflows/build-and-push-docker-image.yml@v1.1.1
    with:
      image-name: ghcr.io/ls1intum/prompt2-intro-course/prompt-server-intro-course
      docker-file: servers/intro_course/Dockerfile
      docker-context: ./servers/intro_course
      tag: ${{ inputs.release_tag }}

  client:
    uses: ls1intum/.github/.github/workflows/build-and-push-docker-image.yml@v1.1.1
    with:
      image-name: ghcr.io/ls1intum/prompt2-intro-course/prompt-clients-intro-course-developer
      docker-file: clients/intro_course_developer_component/Dockerfile
      docker-context: ./clients/intro_course_developer_component
      tag: ${{ inputs.release_tag }}
      build-args: "IMAGE_TAG=latest" # Or pin to a specific prompt-clients-base tag
```

### 6.2 Deploy Workflow

Create `.github/workflows/deploy.yml` mirroring the monorepo's `deploy-docker.yml`:

1. SSH to VM via gateway (reuse same secrets)
2. SCP `docker-compose.prod.yml` to VM (different path, e.g., `/opt/prompt2-intro-course/`)
3. Write `.env.prod` with image tags and secrets
4. `docker compose -f docker-compose.prod.yml --env-file=.env.prod up --pull=always -d`

**Important:** The deploy should NOT stop/restart the main PROMPT services. It manages only the intro course containers independently.

### 6.3 Release Flow

```yaml
# .github/workflows/prod.yml
name: Production Release
on:
  release:
    types: [published]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd servers/intro_course && go test ./...

  build:
    needs: test
    uses: ./.github/workflows/build-and-push.yml
    with:
      release_tag: "${{ github.event.release.tag_name }},latest"

  deploy:
    needs: build
    uses: ./.github/workflows/deploy.yml
    with:
      server_image_tag: ${{ needs.build.outputs.server_image_tag }}
      client_image_tag: ${{ needs.build.outputs.client_image_tag }}
    secrets: inherit
```

---

## Phase 7: Remove from the Monorepo

### 7.1 Remove Source Code

```bash
rm -rf servers/intro_course/
rm -rf clients/intro_course_developer_component/
```

### 7.2 Remove from Client Workspace Config

**`clients/package.json`** — Remove from `workspaces.packages`:

```diff
- "intro_course_developer_component",
```

**`clients/lerna.json`** — Remove from `packages`:

```diff
- "intro_course_developer_component",
```

**`clients/eslint.config.mjs`** — Remove from config array.

### 7.3 Update Core Client (Keep Integration Wiring)

**`clients/core/webpack.config.ts`** — The Module Federation remote config **must stay**:

```typescript
// These MUST remain — the core still loads the remote at runtime
const introCourseDeveloperURL = IS_DEV ? 'http://localhost:3005' : '/intro-course-developer'

remotes: {
  intro_course_developer_component: `intro_course_developer_component@${introCourseDeveloperURL}/remoteEntry.js?${Date.now()}`,
}
```

The lazy-loaded wrappers in `core/src/managementConsole/PhaseMapping/` also **must stay**:

- `ExternalSidebars/IntroCourseDeveloperSidebar.tsx`
- `ExternalRoutes/IntroCourseDeveloperRoutes.tsx`
- `ExternalStudentDetailComponents/IntroCourseDeveloperStudentDetailComponent.tsx`
- Entries in `PhaseSidebarMapping.tsx`, `PhaseRouterMapping.tsx`, `PhaseStudentDetailMapping.tsx`

These are the **runtime integration points** — they load the remote module at runtime and don't need the source code to be in the monorepo.

### 7.4 Update Core Server

**`servers/core/coursePhaseType/initializeTypes.go`** — The `initIntroCourseDeveloper()` function **must stay** (or be made dynamic). It registers the phase type URL in the database so the core knows how to route to the intro course service. The URL `{CORE_HOST}/intro-course/api` remains valid as long as Traefik routes traffic to the external container.

**Alternative (long-term):** Implement a **self-registration API** where external microservices register their phase type at startup by calling the core server. This would eliminate the need for core to know about external services at compile time.

### 7.5 Remove from CI/CD Workflows

**`.github/workflows/build-and-push-servers.yml`** — Remove the `intro-course` job and its output.

**`.github/workflows/build-and-push-clients.yml`** — Remove the `intro-course-developer` job and its output.

**`.github/workflows/dev.yml`** and **`.github/workflows/prod.yml`** — Remove intro course image tag propagation from the build → deploy chain.

**`.github/workflows/deploy-docker.yml`** — Remove:

- `server_intro_course_image_tag` and `intro_course_developer_image_tag` inputs
- `SERVER_INTRO_COURSE_IMAGE_TAG` and `INTRO_COURSE_DEVELOPER_IMAGE_TAG` from `.env.prod` generation
- `DB_HOST_INTRO_COURSE`, `DB_PORT_INTRO_COURSE`, `SENTRY_DSN_INTRO_COURSE`, `GITLAB_ACCESS_TOKEN` from `.env.prod`
- `INTRO_COURSE_HOST` from `.env.prod`

### 7.6 Remove from Docker Compose

**`docker-compose.prod.yml`** — Remove:

- `server-intro-course` service
- `db-intro-course` service
- `client-intro-course-developer-component` service
- Related volumes

**`docker-compose.yml`** (local dev) — Remove:

- `server-intro-course` service
- `db-intro-course` service

### 7.7 Environment Variable Cleanup

Remove from `clients/core/public/env.js` and `env.template.js`:

```diff
- INTRO_COURSE_HOST: 'http://localhost:8082',
```

**Wait — this is still needed!** The core client's `env.js` provides the backend URL to the intro course micro-frontend at runtime. This variable should **remain in the core's env.js** since the core app still hosts the intro course UI via Module Federation and needs to know where the API is.

---

## Phase 8: Database Migration

### 8.1 Production Data

The intro course already has a **dedicated database** (`db-intro-course`). Options:

1. **Keep the existing database container and volume** — The new docker-compose simply references the same volume name. If both compose files use `intro-course-db-data` (or whatever the existing volume is named), the data persists across the transition.

2. **Backup and restore** — `pg_dump` from the old container, `pg_restore` into the new one. Safest approach:

   ```bash
   # On the VM, before the switch
   docker exec db-intro-course pg_dump -U postgres intro_course > intro_course_backup.sql

   # After new compose is up
   docker exec -i db-intro-course psql -U postgres intro_course < intro_course_backup.sql
   ```

### 8.2 Migration Strategy

1. Deploy the new repo's services **alongside** the old ones (they'll conflict on container names — stop old ones first)
2. Or: Coordinate a single maintenance window:
   - Stop old intro course containers (from monorepo compose)
   - Verify DB volume exists
   - Start new intro course containers (from new repo compose)

---

## Phase 9: Local Development Setup

### 9.1 New Repo's `docker-compose.yml` (Local Dev)

```yaml
services:
  db-intro-course:
    image: postgres:15.2-alpine
    ports:
      - "5433:5432"
    environment:
      - POSTGRES_DB=intro_course
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - intro-course-db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d intro_course"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  intro-course-db-data:
```

The server runs directly (`go run main.go`) and the client runs via `yarn dev` (webpack dev server on port 3005).

### 9.2 Developer Experience

Developers working on the intro course need:

- The new repo checked out
- The monorepo's core running (for the shell app + Keycloak + core server)
- `shared_library` available (either via base image or npm package)

For local dev without Docker:

1. Run monorepo: `cd clients && yarn dev` (starts core + shared_library dev server)
2. Run new repo server: `cd servers/intro_course && go run main.go`
3. Run new repo client: `cd clients/intro_course_developer_component && yarn dev`

The Module Federation dev setup works because the core's webpack config already points to `http://localhost:3005` for the intro course developer component.

---

## Execution Order (Checklist)

### Preparation (No Downtime)

- [ ] **P1.** Decide on `shared_library` strategy (Option A, B, or C)
- [ ] **P2.** If Option A: Publish `shared_library` as npm package, update all consumers
- [ ] **P3.** Create new GitHub repository `ls1intum/prompt2-intro-course`
- [ ] **P4.** Set up GHCR access for the new repo (package permissions)
- [ ] **P5.** Configure GitHub Actions secrets (SSH keys, DB passwords, Keycloak, GitLab token, Sentry DSN)

### Migration (No Downtime)

- [ ] **M1.** Copy/filter source code into new repo (server, client, nginx config)
- [ ] **M2.** Adapt server Dockerfile (standalone, not shared)
- [ ] **M3.** Adapt client Dockerfile (handle shared_library dependency)
- [ ] **M4.** Create new repo's CI/CD workflows (build, test, deploy)
- [ ] **M5.** Create new repo's `docker-compose.prod.yml` with Traefik labels and `prompt-network`
- [ ] **M6.** Test build pipeline — verify images push to GHCR

### Cutover (Brief Maintenance Window)

- [ ] **C1.** Backup intro course database on the VM
- [ ] **C2.** Stop intro course containers via monorepo compose
- [ ] **C3.** Deploy new repo's compose to the VM (same `prompt-network`)
- [ ] **C4.** Verify Traefik picks up the new containers (check routing)
- [ ] **C5.** Test all intro course functionality end-to-end

### Cleanup (No Downtime)

- [ ] **X1.** Remove source code from monorepo (`servers/intro_course/`, `clients/intro_course_developer_component/`)
- [ ] **X2.** Remove from `clients/package.json` workspaces, `lerna.json`, `eslint.config.mjs`
- [ ] **X3.** Remove intro course jobs from CI/CD workflows (build, deploy)
- [ ] **X4.** Remove intro course services from `docker-compose.prod.yml` and `docker-compose.yml`
- [ ] **X5.** Remove intro course env vars from `deploy-docker.yml` (but **keep** `INTRO_COURSE_HOST` in `env.js`)
- [ ] **X6.** **Keep** Module Federation wiring in core webpack + lazy-loaded wrapper components
- [ ] **X7.** **Keep** `initIntroCourseDeveloper()` in core server (or implement self-registration)
- [ ] **X8.** Update monorepo README to document the extraction

---

## Risk Assessment

| Risk                                      | Impact                                             | Mitigation                                                                                           |
| ----------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `shared_library` breaking changes         | Client build fails                                 | Pin base image tag; test builds before cutover                                                       |
| Traefik doesn't discover new containers   | 502 errors on intro course routes                  | Test on dev VM first; verify `prompt-network` connectivity                                           |
| Database volume name mismatch             | Data loss                                          | Backup DB before cutover; verify volume names match                                                  |
| `prompt-sdk` breaking update              | Server won't start                                 | Pin SDK version in `go.mod`; test with CI                                                            |
| Core server phase type registration stale | Phase type URL points nowhere                      | URL is Traefik-routed (`{CORE_HOST}/intro-course/api`), so works regardless of container origin      |
| Module Federation version mismatch        | Runtime JS errors                                  | Keep same webpack/react versions aligned with monorepo                                               |
| Cross-repo deploy ordering                | New images deployed but core expects old interface | The Module Federation interface is stable (routes/sidebar/provide); changes are backwards-compatible |

---

## Future Considerations

1. **Self-registration API**: Add an endpoint to the core server where microservices register their phase type at startup, eliminating hardcoded `initIntroCourseDeveloper()`.
2. **Publish `shared_library`**: Long-term, publish it as `@tumaet/prompt-shared-library` so all extracted modules are fully independent.
3. **Intro Course Tutor Component**: The `intro_course_tutor_component` is referenced in core's webpack config and mapping files but doesn't exist yet. If it's planned, it should be built in the new repo from the start.
4. **API versioning**: Consider versioning the intro course API (e.g., `/intro-course/api/v1/`) to support independent evolution.
5. **Health checks**: Add a health check endpoint to the intro course server so Traefik can do active health monitoring.
