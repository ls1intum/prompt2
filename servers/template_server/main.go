package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	"github.com/ls1intum/prompt2/servers/template_server/config"
	"github.com/ls1intum/prompt2/servers/template_server/copy"
	db "github.com/ls1intum/prompt2/servers/template_server/db/sqlc"
	"github.com/ls1intum/prompt2/servers/template_server/utils"
	log "github.com/sirupsen/logrus"
)

func getDatabaseURL() string {
	dbUser := promptSDK.GetEnv("DB_USER", "prompt-postgres")
	dbPassword := promptSDK.GetEnv("DB_PASSWORD", "prompt-postgres")
	dbHost := promptSDK.GetEnv("DB_HOST_TEMPLATE_SERVER", "localhost")
	dbPort := promptSDK.GetEnv("DB_PORT_TEMPLATE_SERVER", "5437")
	dbName := promptSDK.GetEnv("DB_NAME", "prompt")
	sslMode := promptSDK.GetEnv("SSL_MODE", "disable")
	timeZone := promptSDK.GetEnv("DB_TIMEZONE", "Europe/Berlin") // Add a timezone parameter

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

func initKeycloak(queries db.Queries) {
	baseURL := promptSDK.GetEnv("KEYCLOAK_HOST", "http://localhost:8081")
	if !strings.HasPrefix(baseURL, "http") {
		log.Warn("Keycloak host does not start with http(s). Adding https:// as prefix.")
		baseURL = "https://" + baseURL
	}

	realm := promptSDK.GetEnv("KEYCLOAK_REALM_NAME", "prompt")

	coreURL := utils.GetCoreUrl()
	err := promptSDK.InitAuthenticationMiddleware(baseURL, realm, coreURL)
	if err != nil {
		log.Fatalf("Failed to initialize keycloak: %v", err)
	}
}

func main() {
	// establish database connection
	databaseURL := getDatabaseURL()
	dbUser := promptSDK.GetEnv("DB_USER", "prompt-postgres")
	dbHost := promptSDK.GetEnv("DB_HOST_TEMPLATE_SERVER", "localhost")
	dbPort := promptSDK.GetEnv("DB_PORT_TEMPLATE_SERVER", "5437")
	dbName := promptSDK.GetEnv("DB_NAME", "prompt")
	sslMode := promptSDK.GetEnv("SSL_MODE", "disable")
	log.Debugf("Connecting to database at host=%s port=%s db=%s user=%s sslmode=%s", dbHost, dbPort, dbName, dbUser, sslMode)

	// run migrations
	runMigrations(databaseURL)

	// establish db connection
	conn, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v\n", err)
	}
	defer conn.Close()

	query := db.New(conn)

	clientHost := promptSDK.GetEnv("CORE_HOST", "http://localhost:3000")

	router := gin.Default()
	router.Use(promptSDK.CORSMiddleware(clientHost))

	api := router.Group("template-server/api/course_phase/:coursePhaseID")
	initKeycloak(*query)

	api.GET("/hello", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello from the template service"})
	})

	copyApi := router.Group("template-server/api")
	copy.InitCopyModule(copyApi, *query, conn)

	config.InitConfigModule(api, *query, conn)

	serverAddress := promptSDK.GetEnv("SERVER_ADDRESS", "localhost:8086")
	err = router.Run(serverAddress)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
