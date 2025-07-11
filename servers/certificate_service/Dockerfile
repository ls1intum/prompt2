# Build stage
FROM golang:1.20-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o certificate-service

# Typst stage - install typst
FROM rust:1.70-alpine AS typst-builder
RUN apk add --no-cache git musl-dev
RUN cargo install --git https://github.com/typst/typst.git

# Final stage
FROM alpine:3.18

# Copy typst from builder
COPY --from=typst-builder /usr/local/cargo/bin/typst /usr/local/bin/typst

# Copy our service
WORKDIR /app
COPY --from=builder /app/certificate-service .
COPY templates ./templates

ENV PORT=8080
EXPOSE 8080

CMD ["./certificate-service"]
