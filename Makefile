.PHONY: help server server-core server-certificate server-assessment server-interview servers clients client-core client-certificate client-assessment client-interview db db-down lint-clients lint-servers test-core sqlc swagger install-clients install-hooks

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
server: ## Start the core server (alias for server-core)
	cd servers/core && go run main.go

server-core: ## Start the core server
	cd servers/core && go run main.go

server-certificate: ## Start the certificate server
	cd servers/certificate && SERVER_ADDRESS=localhost:8088 go run main.go

server-assessment: ## Start the assessment server
	cd servers/assessment && SERVER_ADDRESS=localhost:8085 go run main.go

server-interview: ## Start the interview server
	cd servers/interview && SERVER_ADDRESS=localhost:8087 go run main.go

servers: ## Start all servers (requires multiple terminals - prints instructions)
	@echo "To start all servers, run each command in a separate terminal:"
	@echo "  make server-core"
	@echo "  make server-certificate"
	@echo "  make server-assessment"
	@echo "  make server-interview"

clients: ## Start all client micro-frontends
	cd clients && yarn install && yarn run dev

client-core: ## Start only the core client
	cd clients/core && yarn dev

client-certificate: ## Start only the certificate client
	cd clients/certificate_component && yarn dev

client-assessment: ## Start only the assessment client
	cd clients/assessment_component && yarn dev

client-interview: ## Start only the interview client
	cd clients/interview_component && yarn dev

client-matching: ## Start only the matching client
	cd clients/matching_component && yarn dev

db: ## Start database and Keycloak
	docker-compose up -d db keycloak

db-down: ## Stop database and Keycloak
	docker-compose down

# Code quality
lint-clients: ## Lint all clients
	cd clients && yarn eslint "core" --config "core/eslint.config.mjs"

lint-servers: ## Run go vet on servers
	cd servers/core && go vet ./...

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
