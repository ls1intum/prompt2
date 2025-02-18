package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ls1intum/prompt2/servers/intro_course/keycloakTokenVerifier"
	"github.com/ls1intum/prompt2/servers/intro_course/utils"
	log "github.com/sirupsen/logrus"
)

func getDatabaseURL() string {
	dbUser := utils.GetEnv("DB_USER", "prompt-postgres")
	dbPassword := utils.GetEnv("DB_PASSWORD", "prompt-postgres")
	dbHost := utils.GetEnv("DB_HOST_INTRO_COURSE", "localhost")
	dbPort := utils.GetEnv("DB_PORT_INTRO_COURSE", "5433")
	dbName := utils.GetEnv("DB_NAME", "prompt")
	sslMode := utils.GetEnv("SSL_MODE", "disable")
	timeZone := utils.GetEnv("DB_TIMEZONE", "Europe/Berlin") // Add a timezone parameter

	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s&TimeZone=%s", dbUser, dbPassword, dbHost, dbPort, dbName, sslMode, timeZone)
}

func runMigrations(databaseURL string) {
	cmd := exec.Command("migrate", "-path", "./db/migration", "-database", databaseURL, "up")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}
}

func initKeycloak() {
	baseURL := utils.GetEnv("KEYCLOAK_HOST", "http://localhost:8081")
	if !strings.HasPrefix(baseURL, "http") {
		baseURL = "https://" + baseURL
	}

	realm := utils.GetEnv("KEYCLOAK_REALM_NAME", "prompt")
	clientID := utils.GetEnv("KEYCLOAK_CLIENT_ID", "prompt-server")
	expectedAuthorizedParty := utils.GetEnv("KEYCLOAK_AUTHORIZED_PARTY", "prompt-client")

	log.Info("Debugging: baseURL: ", baseURL, " realm: ", realm, " clientID: ", clientID, " expectedAuthorizedParty: ", expectedAuthorizedParty)

	keycloakTokenVerifier.InitKeycloakTokenVerifier(context.Background(), baseURL, realm, clientID, expectedAuthorizedParty)
}

func main() {
	// establish database connection
	databaseURL := getDatabaseURL()
	log.Debug("Connecting to database at:", databaseURL)

	// run migrations
	runMigrations(databaseURL)

	// establish db connection
	conn, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v\n", err)
		os.Exit(1)
	}
	defer conn.Close()

	// query := db.New(conn)

	router := gin.Default()
	router.Use(utils.CORS())

	// init keycloak
	initKeycloak()

	api := router.Group("intro-course/api")
	api.GET("/hello/:coursePhaseID", keycloakTokenVerifier.AuthMiddleware(), func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello From Your Intro Course Backend",
		})
	})

	serverAddress := utils.GetEnv("SERVER_ADDRESS", "localhost:8082")
	router.Run(serverAddress)
}
