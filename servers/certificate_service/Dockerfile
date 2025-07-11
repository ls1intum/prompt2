# Build stage
FROM golang:1.24-alpine AS builder

# Install dependencies
RUN apk add --no-cache curl

# Install migrate
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/v4.18.1/migrate.linux-amd64.tar.gz | tar xvz && \
    mv migrate /usr/local/bin/

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o certificate-service

# Typst stage - install typst
FROM rust:1.75-alpine AS typst-builder
RUN apk add --no-cache git musl-dev
RUN cargo install --git https://github.com/typst/typst.git --tag v0.11.1

# Final stage
FROM alpine:3.18

# Install ca-certificates for HTTPS requests
RUN apk add --no-cache ca-certificates

# Copy migrate tool
COPY --from=builder /usr/local/bin/migrate /usr/local/bin/migrate

# Copy typst from builder
COPY --from=typst-builder /usr/local/cargo/bin/typst /usr/local/bin/typst

# Copy our service
WORKDIR /app
COPY --from=builder /app/certificate-service .
COPY --from=builder /app/db/migration ./db/migration
COPY sample_template.typ ./

# Create directories for fonts and temporary files
RUN mkdir -p /app/fonts /tmp

ENV PORT=8080
EXPOSE 8080

CMD ["./certificate-service"]
