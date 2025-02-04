package testutils

import (
	"context"
	"fmt"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/sirupsen/logrus"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

type TestDB struct {
	Conn    *pgxpool.Pool
	Queries *db.Queries
}

type DatabaseSuite struct {
	suite.Suite
	container testcontainers.Container
	Conn      *pgxpool.Pool
}

func (ds *DatabaseSuite) SetupSuite() {
	ctx := context.Background()
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
	ds.Require().NoError(err)

	logrus.Info("started container")

	// set test container
	ds.container = container

	// Get container's host and port
	host, err := container.Host(ctx)
	ds.Require().NoError(err)
	port, err := container.MappedPort(ctx, "5432/tcp")
	ds.Require().NoError(err)

	logrus.Info("host: ", host, " port: ", port.Port())

	dbURL := fmt.Sprintf("postgres://testuser:testpass@%s:%s/prompt?sslmode=disable", host, port.Port())

	// Connect to the database
	conn, err := pgxpool.New(ctx, dbURL)
	ds.Require().NoError(err)

	logrus.Info("connected to database")

	ds.Conn = conn
}

func (ds *DatabaseSuite) TearDownSuite() {
	logrus.Info("tearing down suite")
	ctx := context.Background()

	ds.Conn.Close()
	ds.container.Terminate(ctx)
}

func RunSQLDump(conn *pgxpool.Pool, path string) error {
	dump, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("could not read SQL dump file: %w", err)
	}
	_, err = conn.Exec(context.Background(), string(dump))
	return err
}
