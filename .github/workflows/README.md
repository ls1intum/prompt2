# CI/CD Workflows

This document explains how the GitHub Actions CI/CD pipeline works for PROMPT 2.0 and how to extend it when adding new phases (client components or server modules).

## Table of Contents

- [Overview](#overview)
- [Workflow Map](#workflow-map)
- [Key Concepts](#key-concepts)
- [Workflow Reference](#workflow-reference)
- [Adding a New Phase](#adding-a-new-phase)
- [Troubleshooting](#troubleshooting)

---

## Overview

The pipeline has two entry points:

| Trigger | Workflow | Purpose |
|---|---|---|
| Pull request → `main` | `dev.yml` (PR path) | Lint, test, smart build/retag all images as `pr-<N>`, deploy to dev |
| Push to `main` | `dev.yml` (main path) | Full build of all images tagged `main-latest`, deploy to dev |
| GitHub Release published | `prod.yml` | Full build tagged with release version + `latest`, deploy to prod |

---

## Workflow Map

### PR Flow (`pull_request` event)

```
dev.yml
│
├── assign-author          (add PR author as assignee)
├── detect-migrations      (label PR if DB migrations changed)
├── detect-changes         (determine what changed → outputs used by everything below)
│
├── lint-servers           (golangci-lint, only changed server modules)
├── test-servers           (go test, only changed server modules; needs lint)
├── lint-clients           (eslint, only changed client modules)
├── generate-api-spec      (swag, only changed server modules with swaggo)
│
├── build-clients-pr       ← build-clients-pr.yml (smart: build or retag)
│   ├── build-base         (ls1intum multi-arch build, only if base files changed)
│   ├── retag-clients      (crane cp, retags base + unchanged components from main-latest)
│   └── build-core/template/interview/...  (ls1intum, one job per component, only if needed)
│
├── build-servers-pr       ← build-servers-pr.yml (smart: build or retag)
│   ├── build-core/intro-course/...        (ls1intum, one job per server, only if changed)
│   └── retag-servers      (crane cp, retags all unchanged servers from main-latest)
│
└── deploy-dev-pr          ← deploy-docker.yml (deploys pr-<N> tags to dev VM)
```

### Main Branch Flow (`push` event)

```
dev.yml
│
├── detect-changes         (still runs, feeds lint/test)
├── lint-servers / test-servers / lint-clients / generate-api-spec
│
├── build-clients-main     ← build-and-push-clients.yml (builds ALL clients, tags main-latest)
├── build-servers-main     ← build-and-push-servers.yml (builds ALL servers, tags main-latest)
│
└── deploy-dev-main        ← deploy-docker.yml (deploys with individual SHA-based tags)
```

### Prod Flow (`release` event → `prod.yml`)

```
prod.yml
│
├── detect-changes / lint / test
├── build-clients          ← build-and-push-clients.yml (tags: v1.2.3,latest)
├── build-servers          ← build-and-push-servers.yml (tags: v1.2.3,latest)
└── deploy-prod            ← deploy-docker.yml
```

---

## Key Concepts

### Build or Retag

The core optimization for PR builds. Instead of rebuilding all ~17 Docker images on every PR, each image is either:

- **Built** (full `docker build`, multi-arch via `ls1intum/.github` reusable workflow) — when the image's source files changed, or when its base image changed.
- **Retagged** (instant manifest copy via `crane cp`) — when nothing relevant changed. The existing `main-latest` image is copied under the `pr-<N>` tag. No layers are transferred; this completes in ~2 seconds.

`crane cp` correctly preserves multi-arch manifests, so retagged images are identical to their source.

### The `main-latest` Tag

Every push to `main` builds all images and tags them `main-latest` (in addition to the auto-generated SHA-based tag from the `ls1intum` reusable workflow). This tag is the **retag source** for PR builds — unchanged images in a PR are retagged from `main-latest`.

> **Important:** `main-latest` always reflects the most recent successful build on `main`. If `main` has never been built (e.g., a brand-new repo), the first PR will attempt to retag from a non-existent `main-latest`. In this case, `crane cp` will fail and the workflow will error — simply merge a commit to `main` first to establish the baseline.

### PR Image Tags

All images for a PR are tagged `pr-<number>` (e.g., `pr-42`). The deploy workflow receives the PR number and sets all image tags to `pr-<number>` in the `.env.prod` file on the dev VM.

### Client Base Image Dependency

The client images have a two-level dependency:

```
clients/Dockerfile  →  prompt-clients-base
                              ↓
          core, template, interview, matching,
          intro-course-dev, assessment, devops-challenge,
          team-allocation, self-team-allocation
```

If any of the base image inputs change (`clients/Dockerfile`, `clients/shared_library/**`, `clients/package.json`, `clients/yarn.lock`, `clients/lerna.json`, `clients/nginx/**`), **all** component images are rebuilt using the new base. This is controlled by the `client_base_changed` output from `detect-changes.yml`.

### Change Detection

`detect-changes.yml` runs on every PR/push and produces these outputs, consumed by downstream workflows:

| Output | Used by | Description |
|---|---|---|
| `server_modules` | lint-servers, test-servers | Server modules where source files changed |
| `client_modules` | lint-clients | Client modules where source files changed |
| `api_spec_directories` | generate-api-spec | Server modules with swaggo that changed |
| `client_base_changed` | build-clients-pr | `true` if base image inputs changed |
| `clients_to_build` | build-clients-pr | Component dirs needing a full Docker build |
| `servers_to_build` | build-servers-pr | Server modules needing a full Docker build |

---

## Workflow Reference

| File | Trigger | Description |
|---|---|---|
| `dev.yml` | PR + push to main | Entry point for development pipeline |
| `prod.yml` | GitHub Release | Entry point for production pipeline |
| `detect-changes.yml` | `workflow_call` | Detects which modules changed |
| `detect-migrations.yml` | `workflow_call` | Labels PRs that contain DB migrations |
| `build-clients-pr.yml` | `workflow_call` | Smart build-or-retag for client images (PR only) |
| `build-servers-pr.yml` | `workflow_call` | Smart build-or-retag for server images (PR only) |
| `build-and-push-clients.yml` | `workflow_call` | Full build of all client images (main + prod) |
| `build-and-push-servers.yml` | `workflow_call` | Full build of all server images (main + prod) |
| `deploy-docker.yml` | `workflow_call` | SSH deploy to VM via docker compose |
| `lint-clients.yml` | `workflow_call` | ESLint for changed client modules |
| `lint-servers.yml` | `workflow_call` | golangci-lint for changed server modules |
| `test-servers.yml` | `workflow_call` | Go tests for changed server modules |
| `generate-api-spec.yml` | `workflow_call` | Swagger spec generation |
| `build-docs.yml` | push to main (docs/) | Builds and deploys Docusaurus to GitHub Pages |
| `discord-notifications.yml` | PR labeled | Sends Discord review request |

---

## Adding a New Phase

When you add a new course phase (a new client component + server module pair), you need to update **6 files** and follow the steps below. The checklist uses `my_phase` as an example name — replace it with your actual module name.

### 1. Add the Server Module

**In `build-and-push-servers.yml`** — add a new job for the full build (used on main branch and prod):

```yaml
  my-phase:
    needs: resolve-tags
    uses: ls1intum/.github/.github/workflows/build-and-push-docker-image.yml@v1.2.0
    with:
      image-name: ghcr.io/prompt-edu/prompt/prompt-server-my-phase
      docker-file: servers/Dockerfile
      docker-context: ./servers/my_phase
      tags: ${{ needs.resolve-tags.outputs.tags }}
    secrets: inherit
```

Also add the output at the top of the file:

```yaml
    outputs:
      # ... existing outputs ...
      server_my_phase_image_tag:
        description: "The tag of the my-phase server image that was built"
        value: ${{ jobs.my-phase.outputs.image_tag }}
```

**In `build-servers-pr.yml`** — add the conditional build job:

```yaml
  build-my-phase:
    if: contains(fromJson(inputs.servers_to_build), 'my_phase')
    uses: ls1intum/.github/.github/workflows/build-and-push-docker-image.yml@v1.2.0
    with:
      image-name: ghcr.io/prompt-edu/prompt/prompt-server-my-phase
      docker-file: servers/Dockerfile
      docker-context: ./servers/my_phase
      tags: "pr-${{ inputs.pr_number }}"
    secrets: inherit
```

Then add it to the `retag_if_unchanged` list in the `retag-servers` job's shell script:

```bash
retag_if_unchanged "prompt-server-my-phase" "my_phase"
```

### 2. Add the Client Component

**In `build-and-push-clients.yml`** — add a new job for the full build:

```yaml
  my-phase:
    needs: [resolve-tags, clients-base]
    uses: ls1intum/.github/.github/workflows/build-and-push-docker-image.yml@v1.2.0
    with:
      image-name: ghcr.io/prompt-edu/prompt/prompt-clients-my-phase-component
      docker-file: clients/my_phase_component/Dockerfile
      docker-context: ./clients/my_phase_component
      tags: ${{ needs.resolve-tags.outputs.tags }}
      build-args: |
        "IMAGE_TAG=${{ needs.clients-base.outputs.image_tag }}"
        "CORE_HOST=${{ vars.CORE_HOST }}"
    secrets: inherit
```

Also add the output:

```yaml
    outputs:
      # ... existing outputs ...
      my_phase_image_tag:
        description: "The tag of the my-phase component image that was built"
        value: ${{ jobs.my-phase.outputs.image_tag }}
```

**In `build-clients-pr.yml`** — add the conditional build job:

```yaml
  build-my-phase:
    needs: [build-base, retag-clients]
    if: |
      always() && !cancelled() &&
      !contains(needs.*.result, 'failure') &&
      (inputs.client_base_changed == 'true' ||
       contains(fromJson(inputs.clients_to_build), 'my_phase_component'))
    uses: ls1intum/.github/.github/workflows/build-and-push-docker-image.yml@v1.2.0
    with:
      image-name: ghcr.io/prompt-edu/prompt/prompt-clients-my-phase-component
      docker-file: clients/my_phase_component/Dockerfile
      docker-context: ./clients/my_phase_component
      tags: "pr-${{ inputs.pr_number }}"
      build-args: |
        "IMAGE_TAG=pr-${{ inputs.pr_number }}"
        "CORE_HOST=${{ vars.CORE_HOST }}"
    secrets: inherit
```

Then add it to the `retag_if_unchanged` list in the `retag-clients` job's shell script:

```bash
retag_if_unchanged "prompt-clients-my-phase-component" "my_phase_component"
```

### 3. Wire the Tags into the Deploy Workflow

**In `deploy-docker.yml`** — add the new image tags to the `inputs` block:

```yaml
      my_phase_image_tag:
        required: false
        type: string
        default: ""
      server_my_phase_image_tag:
        required: false
        type: string
        default: ""
```

Then add them to **both** branches of the tag-resolution block in the SSH script:

```bash
# Inside the if [ -n "$PR_NUMBER" ] branch:
echo "MY_PHASE_IMAGE_TAG=$TAG" >> .env.prod
echo "SERVER_MY_PHASE_IMAGE_TAG=$TAG" >> .env.prod

# Inside the else branch:
echo "MY_PHASE_IMAGE_TAG=${{ inputs.my_phase_image_tag }}" >> .env.prod
echo "SERVER_MY_PHASE_IMAGE_TAG=${{ inputs.server_my_phase_image_tag }}" >> .env.prod
```

### 4. Wire the Tags into `dev.yml`

In `deploy-dev-main` (the main-branch deploy job), add the new outputs:

```yaml
      my_phase_image_tag: ${{ needs.build-clients-main.outputs.my_phase_image_tag }}
      server_my_phase_image_tag: ${{ needs.build-servers-main.outputs.server_my_phase_image_tag }}
```

The PR deploy (`deploy-dev-pr`) needs no changes — it uses `pr_number` and resolves all tags automatically.

### 5. Wire the Tags into `prod.yml`

Same as step 4 but in `prod.yml`'s deploy job:

```yaml
      my_phase_image_tag: ${{ needs.build-clients.outputs.my_phase_image_tag }}
      server_my_phase_image_tag: ${{ needs.build-servers.outputs.server_my_phase_image_tag }}
```

### 6. Update `docker-compose.prod.yml`

Add the new services to `docker-compose.prod.yml` using the new env vars:

```yaml
  client-my-phase-component:
    image: ghcr.io/prompt-edu/prompt/prompt-clients-my-phase-component:${MY_PHASE_IMAGE_TAG}
    ...

  server-my-phase:
    image: ghcr.io/prompt-edu/prompt/prompt-server-my-phase:${SERVER_MY_PHASE_IMAGE_TAG}
    ...
```

### Summary Checklist

- [ ] `build-and-push-servers.yml` — add job + output
- [ ] `build-servers-pr.yml` — add build job + retag entry
- [ ] `build-and-push-clients.yml` — add job + output
- [ ] `build-clients-pr.yml` — add build job + retag entry
- [ ] `deploy-docker.yml` — add inputs + env vars in both tag branches
- [ ] `dev.yml` — add outputs to `deploy-dev-main`
- [ ] `prod.yml` — add outputs to `deploy-prod`
- [ ] `docker-compose.prod.yml` — add new services

> **No changes needed** to `detect-changes.yml` — it automatically discovers new server modules (via `go.mod`) and new client components (via `Dockerfile`) at runtime.

---

## Troubleshooting

### `crane cp` fails with "manifest unknown"

The `main-latest` tag doesn't exist yet for one or more images. This happens when:
- The repository was just set up and `main` has never had a successful build.
- A new image was added to the PR workflows before a main-branch build ran.

**Fix:** Merge a commit to `main` (or trigger a manual workflow run on main) to establish the `main-latest` baseline.

### A component image is rebuilt even though its files didn't change

Check if the **client base image inputs** changed (`clients/Dockerfile`, `clients/shared_library/**`, `clients/package.json`, `clients/yarn.lock`, `clients/lerna.json`, `clients/nginx/**`). Any change to these files triggers a full rebuild of all client components. This is by design — the base image is baked into every component image.

### Build job is skipped unexpectedly

Component build jobs in `build-clients-pr.yml` use `always()` in their `if:` condition. If a job is still being skipped, check that:
1. The `if:` condition correctly references `inputs.clients_to_build` using `contains(fromJson(...), 'your_module_dir_name')`.
2. The directory name in the `contains()` call matches the actual directory name under `clients/` (e.g., `my_phase_component`, not `my-phase-component`).

### The detect-changes step references `changed-server-root` but no such step exists

This is a known pre-existing placeholder in `detect-changes.yml`. The variable `server_root_changed` will always be empty (treated as `false`), which is safe — global server root changes are not currently tracked separately.
