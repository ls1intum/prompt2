########################
# Dev (hot reload)
########################
FROM golang:1.24-alpine AS dev

WORKDIR /app
RUN apk add --no-cache git ca-certificates curl
# Install migrate (app expects it on PATH)
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.18.1/migrate.linux-amd64.tar.gz | tar xvz && \
    mv migrate /usr/local/bin/
# Pre-cache modules for faster startup when building the dev image
COPY go.mod go.sum ./
RUN go mod download
# Air reloader
RUN go install github.com/air-verse/air@latest
# Copy the rest of the source (bind mount will override in dev)
COPY . .
EXPOSE 8080
CMD ["air", "-c", ".air.toml"]

########################
# Stage 1: Build (prod)
########################
FROM golang:1.24-alpine AS build

# Install dependencies needed for build tools
RUN apk add --no-cache curl ca-certificates

# Install migrate
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.18.1/migrate.linux-amd64.tar.gz | tar xvz && \
    mv migrate /usr/local/bin/

# Set the working directory
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the Go app
RUN CGO_ENABLED=0 go build -o main .

# Stage 2: Final (distroless)
FROM gcr.io/distroless/static-debian12

# Set the working directory
WORKDIR /app

# Copy the built binary and necessary files from the build stage
COPY --from=build /app/main /app/main
COPY --from=build /usr/local/bin/migrate /usr/local/bin/migrate
COPY --from=build /app/db/migration /app/db/migration

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["/app/main"]
