package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ls1intum/prompt2/servers/core/applicationAdministration"
	"github.com/ls1intum/prompt2/servers/core/course"
	"github.com/ls1intum/prompt2/servers/core/course/copy"
	"github.com/ls1intum/prompt2/servers/core/course/courseParticipation"
	"github.com/ls1intum/prompt2/servers/core/coursePhase"
	"github.com/ls1intum/prompt2/servers/core/coursePhase/coursePhaseParticipation"
	"github.com/ls1intum/prompt2/servers/core/coursePhase/resolution"
	"github.com/ls1intum/prompt2/servers/core/coursePhaseAuth"
	"github.com/ls1intum/prompt2/servers/core/coursePhaseType"
	db "github.com/ls1intum/prompt2/servers/core/db/sqlc"
	"github.com/ls1intum/prompt2/servers/core/keycloakRealmManager"
	"github.com/ls1intum/prompt2/servers/core/keycloakTokenVerifier"
	"github.com/ls1intum/prompt2/servers/core/mailing"
	"github.com/ls1intum/prompt2/servers/core/permissionValidation"
	"github.com/ls1intum/prompt2/servers/core/student"
	"github.com/ls1intum/prompt2/servers/core/utils"
	log "github.com/sirupsen/logrus"
)

func getDatabaseURL() string {
	dbUser := utils.GetEnv("DB_USER", "prompt-postgres")
	dbPassword := utils.GetEnv("DB_PASSWORD", "prompt-postgres")
	dbHost := utils.GetEnv("DB_HOST", "localhost")
	dbPort := utils.GetEnv("DB_PORT", "5432")
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

func initKeycloak(router *gin.RouterGroup, queries db.Queries) {
	baseURL := utils.GetEnv("KEYCLOAK_HOST", "http://localhost:8081")
	if !strings.HasPrefix(baseURL, "http") {
		baseURL = "https://" + baseURL
	}

	realm := utils.GetEnv("KEYCLOAK_REALM_NAME", "prompt")
	clientID := utils.GetEnv("KEYCLOAK_CLIENT_ID", "prompt-server")
	clientSecret := utils.GetEnv("KEYCLOAK_CLIENT_SECRET", "")
	idOfClient := utils.GetEnv("KEYCLOAK_ID_OF_CLIENT", "a584ca61-fa83-4e95-98b6-c5f3157ae4b4")
	expectedAuthorizedParty := utils.GetEnv("KEYCLOAK_AUTHORIZED_PARTY", "prompt-client")

	log.Info("Debugging: baseURL: ", baseURL, " realm: ", realm, " clientID: ", clientID, " idOfClient: ", idOfClient, " expectedAuthorizedParty: ", expectedAuthorizedParty)

	// first we initialize the keycloak token verfier
	keycloakTokenVerifier.InitKeycloakTokenVerifier(context.Background(), baseURL, realm, clientID, expectedAuthorizedParty, queries)

	err := keycloakRealmManager.InitKeycloak(context.Background(), router, baseURL, realm, clientID, clientSecret, idOfClient, expectedAuthorizedParty, queries)
	if err != nil {
		log.Error("Failed to initialize keycloak: ", err)
	}
}

func initMailing(router *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	log.Debug("Reading mailing environment variables...")

	clientURL := utils.GetEnv("CORE_HOST", "localhost:3000") // required for application link in mails
	smtpHost := utils.GetEnv("SMTP_HOST", "127.0.0.1")
	smtpPort := utils.GetEnv("SMTP_PORT", "25")
	smtpUsername := utils.GetEnv("SMTP_USERNAME", "")
	smtpPassword := utils.GetEnv("SMTP_PASSWORD", "")
	senderEmail := utils.GetEnv("SENDER_EMAIL", "")
	senderName := utils.GetEnv("SENDER_NAME", "Prompt Mailing Service")

	log.Debug("Environment variables read:")
	log.Debug("CORE_HOST: ", clientURL)
	log.Debug("SMTP_HOST: ", smtpHost)
	log.Debug("SMTP_PORT: ", smtpPort)
	log.Debug("SMTP_USERNAME: ", smtpUsername)
	log.Debug("SMTP_PASSWORD: ", "[REDACTED]") // Don't log the actual password
	log.Debug("SENDER_EMAIL: ", senderEmail)
	log.Debug("SENDER_NAME: ", senderName)

	log.Info("Initializing mailing service with SMTP host: ", smtpHost, " port: ", smtpPort, " sender email: ", senderEmail)

	mailing.InitMailingModule(router, queries, conn, smtpHost, smtpPort, smtpUsername, smtpPassword, senderName, senderEmail, clientURL)
}

// @title           PROMPT Core API
// @version         1.0
// @description     This is a core sever of PROMPT.

// @host      localhost:8080
// @BasePath  /api/

// @externalDocs.description  PROMPT Documentation
// @externalDocs.url          https://ls1intum.github.io/prompt2/
func main() {
	if utils.GetEnv("DEBUG", "false") == "true" {
		log.SetLevel(log.DebugLevel)
		log.Debug("Debug mode is enabled")
	}

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
	router.Use(utils.CORS())

	api := router.Group("/api")
	api.GET("/hello", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello World",
		})
	})

	initKeycloak(api, *query)
	permissionValidation.InitValidationService(*query, conn)

	// this initializes also all available course phase types
	environment := utils.GetEnv("ENVIRONMENT", "development")
	isDevEnvironment := environment == "development"
	coursePhaseType.InitCoursePhaseTypeModule(api, *query, conn, isDevEnvironment)

	coreHost := utils.GetEnv("CORE_HOST", "localhost:8080")
	resolution.InitResolutionModule(coreHost)

	coursePhaseAuth.InitCoursePhaseAuthModule(api, *query, conn)
	initMailing(api, *query, conn)
	student.InitStudentModule(api, *query, conn)
	course.InitCourseModule(api, *query, conn)
	copy.InitCourseCopyModule(api, *query, conn)
	coursePhase.InitCoursePhaseModule(api, *query, conn)
	courseParticipation.InitCourseParticipationModule(api, *query, conn)
	coursePhaseParticipation.InitCoursePhaseParticipationModule(api, *query, conn)
	applicationAdministration.InitApplicationAdministrationModule(api, *query, conn)

	serverAddress := utils.GetEnv("SERVER_ADDRESS", "localhost:8080")
	err = router.Run(serverAddress)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
