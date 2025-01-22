package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/niclasheun/prompt2.0/applicationAdministration"
	"github.com/niclasheun/prompt2.0/course"
	"github.com/niclasheun/prompt2.0/course/courseParticipation"
	"github.com/niclasheun/prompt2.0/coursePhase"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation"
	"github.com/niclasheun/prompt2.0/coursePhaseType"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/keycloak"
	"github.com/niclasheun/prompt2.0/mailing"
	"github.com/niclasheun/prompt2.0/permissionValidation"
	"github.com/niclasheun/prompt2.0/student"
	"github.com/niclasheun/prompt2.0/utils"
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

func initKeycloak() {
	baseURL := utils.GetEnv("KEYCLOAK_HOST", "http://localhost:8081")
	if !strings.HasPrefix(baseURL, "http") {
		baseURL = "https://" + baseURL
	}

	realm := utils.GetEnv("KEYCLOAK_REALM_NAME", "prompt")
	clientID := utils.GetEnv("KEYCLOAK_CLIENT_ID", "prompt-server")
	clientSecret := utils.GetEnv("KEYCLOAK_CLIENT_SECRET", "")
	idOfClient := utils.GetEnv("KEYCLOAK_ID_OF_CLIENT", "")
	expectedAuthorizedParty := utils.GetEnv("KEYCLOAK_AUTHORIZED_PARTY", "prompt-client")

	log.Info("Debugging: baseURL: ", baseURL, " realm: ", realm, " clientID: ", clientID, " idOfClient: ", idOfClient, " expectedAuthorizedParty: ", expectedAuthorizedParty)

	err := keycloak.InitKeycloak(context.Background(), baseURL, realm, clientID, clientSecret, idOfClient, expectedAuthorizedParty)
	if err != nil {
		log.Error("Failed to initialize keycloak: ", err)
	}
}

func initMailing(router *gin.RouterGroup, queries db.Queries, conn *pgxpool.Pool) {
	clientURL := utils.GetEnv("CORE_HOST", "localhost:3000") // required for application link in mails
	smtpHost := utils.GetEnv("SMTP_HOST", "127.0.0.1")
	smtpPort := utils.GetEnv("SMTP_PORT", "25")
	senderEmail := utils.GetEnv("SENDER_EMAIL", "prompt-dev@ase.cit.tum.de")
	senderName := utils.GetEnv("SENDER_NAME", "Prompt Mailing Service")

	mailing.InitMailingModule(router, queries, conn, smtpHost, smtpPort, senderName, senderEmail, clientURL)
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

	initKeycloak()
	permissionValidation.InitValidationService(*query, conn)

	router := gin.Default()
	router.Use(utils.CORS())

	api := router.Group("/api")
	api.GET("/hello", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello World",
		})
	})

	initMailing(api, *query, conn)
	student.InitStudentModule(api, *query, conn)
	course.InitCourseModule(api, *query, conn)
	coursePhase.InitCoursePhaseModule(api, *query, conn)
	courseParticipation.InitCourseParticipationModule(api, *query, conn)
	coursePhaseParticipation.InitCoursePhaseParticipationModule(api, *query, conn)
	coursePhaseType.InitCoursePhaseTypeModule(api, *query, conn)
	applicationAdministration.InitApplicationAdministrationModule(api, *query, conn)

	serverAddress := utils.GetEnv("SERVER_ADDRESS", "localhost:8080")
	router.Run(serverAddress)
}
