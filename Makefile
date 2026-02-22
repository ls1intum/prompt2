.PHONY: help server clients db db-down lint lint-clients lint-servers test test-core sqlc swagger install-clients install-hooks

# Load .env file if it exists (base configuration)
ifneq (,$(wildcard ./.env))
    include .env
    export
endif

# Load .env.dev file if it exists (local development overrides)
ifneq (,$(wildcard ./.env.dev))
    include .env.dev
    export
endif

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Development
server: ## Start the core server
	cd servers/core && go run main.go

clients: ## Start all client micro-frontends
	cd clients && yarn install && yarn run dev

db: ## Start database and Keycloak
	docker compose up -d db keycloak

db-down: ## Stop database and Keycloak
	docker compose stop db keycloak 

# Code quality
lint: lint-clients lint-servers ## Lint all code

lint-clients: ## Lint all clients
	cd clients && yarn eslint "core" --config "core/eslint.config.mjs"

lint-servers: ## Run go vet on servers
	cd servers/core && go vet ./...

test: test-core ## Run all tests

test-core: ## Run core server tests
	cd servers/core && go test ./...

# Code generation
sqlc: ## Generate sqlc code for core server
	cd servers/core && sqlc generate

swagger: ## Generate swagger docs for core server
	cd servers/core && swag init

# Setup
install-clients: ## Install client dependencies
	cd clients && yarn install

install-hooks: ## Install git hooks
	./scripts/install-githooks.sh
