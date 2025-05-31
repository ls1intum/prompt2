package testutils

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/ls1intum/prompt2/servers/assessment/db/sqlc"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

type TestDB struct {
	Conn    *pgxpool.Pool
	Queries *db.Queries
}

func SetupTestDB(ctx context.Context, sqlDumpPath string) (*TestDB, func(), error) {
	// Set up PostgreSQL container
	req := testcontainers.ContainerRequest{
		Image:        "postgres:15",
		ExposedPorts: []string{"5432/tcp"},
		Env: map[string]string{
			"POSTGRES_USER":     "testuser",
			"POSTGRES_PASSWORD": "testpass",
			"POSTGRES_DB":       "prompt",
		},
		WaitingFor: wait.ForAll(
			wait.ForLog("database system is ready to accept connections"),
			wait.ForListeningPort("5432/tcp"),
		),
	}

	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true,
	})
	if err != nil {
		return nil, nil, fmt.Errorf("could not start container: %w", err)
	}

	// Get container's host and port
	host, err := container.Host(ctx)
	if err != nil {
		_ = container.Terminate(ctx)
		return nil, nil, fmt.Errorf("could not get container host: %w", err)
	}
	port, err := container.MappedPort(ctx, "5432/tcp")
	if err != nil {
		_ = container.Terminate(ctx)
		return nil, nil, fmt.Errorf("could not get container port: %w", err)
	}
	dbURL := fmt.Sprintf("postgres://testuser:testpass@%s:%s/prompt?sslmode=disable", host, port.Port())

	// Connect to the database
	conn, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		_ = container.Terminate(ctx)
		return nil, nil, fmt.Errorf("failed to connect to the database: %w", err)
	}

	// Run the SQL dump
	if err := runSQLDump(conn, sqlDumpPath); err != nil {
		conn.Close()
		_ = container.Terminate(ctx)
		return nil, nil, fmt.Errorf("failed to run SQL dump: %w", err)
	}

	// Set up the queries
	queries := db.New(conn)

	// Return the TestDB and a cleanup function
	cleanup := func() {
		conn.Close()
		_ = container.Terminate(ctx)
	}

	return &TestDB{
		Conn:    conn,
		Queries: queries,
	}, cleanup, nil
}

func runSQLDump(conn *pgxpool.Pool, path string) error {
	dump, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("could not read SQL dump file: %w", err)
	}
	_, err = conn.Exec(context.Background(), string(dump))
	return err
}
