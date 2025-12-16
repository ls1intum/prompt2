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
	sdkUtils "github.com/ls1intum/prompt-sdk/utils"
	"github.com/ls1intum/prompt2/servers/intro_course/config"
	"github.com/ls1intum/prompt2/servers/intro_course/copy"
	db "github.com/ls1intum/prompt2/servers/intro_course/db/sqlc"
	"github.com/ls1intum/prompt2/servers/intro_course/developerProfile"
	"github.com/ls1intum/prompt2/servers/intro_course/infrastructureSetup"
	"github.com/ls1intum/prompt2/servers/intro_course/seatPlan"
	"github.com/ls1intum/prompt2/servers/intro_course/tutor"
	log "github.com/sirupsen/logrus"
)

func getDatabaseURL() string {
	dbUser := sdkUtils.GetEnv("DB_USER", "prompt-postgres")
	dbPassword := sdkUtils.GetEnv("DB_PASSWORD", "prompt-postgres")
	dbHost := sdkUtils.GetEnv("DB_HOST_INTRO_COURSE", "localhost")
	dbPort := sdkUtils.GetEnv("DB_PORT_INTRO_COURSE", "5433")
	dbName := sdkUtils.GetEnv("DB_NAME", "prompt")
	sslMode := sdkUtils.GetEnv("SSL_MODE", "disable")
	timeZone := sdkUtils.GetEnv("DB_TIMEZONE", "Europe/Berlin") // Add a timezone parameter

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
	baseURL := sdkUtils.GetEnv("KEYCLOAK_HOST", "http://localhost:8081")
	if !strings.HasPrefix(baseURL, "http") {
		baseURL = "https://" + baseURL
	}

	realm := sdkUtils.GetEnv("KEYCLOAK_REALM_NAME", "prompt")
	coreURL := sdkUtils.GetCoreUrl()
	err := promptSDK.InitAuthenticationMiddleware(baseURL, realm, coreURL)
	if err != nil {
		log.Fatalf("Failed to initialize keycloak: %v", err)
	}
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

	query := db.New(conn)

	router := gin.Default()
	localHost := "http://localhost:3000"
	clientHost := sdkUtils.GetEnv("CORE_HOST", localHost)
	router.Use(sdkUtils.CORS(clientHost))

	api := router.Group("intro-course/api/course_phase/:coursePhaseID")
	initKeycloak()
	developerProfile.InitDeveloperProfileModule(api, *query, conn)
	tutor.InitTutorModule(api, *query, conn)
	seatPlan.InitSeatPlanModule(api, *query, conn)

	// Infrastructure Setup
	gitlabAccessToken := sdkUtils.GetEnv("GITLAB_ACCESS_TOKEN", "")
	infrastructureSetup.InitInfrastructureModule(api, *query, conn, gitlabAccessToken)

	copyApi := router.Group("intro-course/api")
	copy.InitCopyModule(copyApi, *query, conn)

	config.InitConfigModule(api, *query, conn)

	serverAddress := sdkUtils.GetEnv("SERVER_ADDRESS", "localhost:8082")
	err = router.Run(serverAddress)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
