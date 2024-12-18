package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/niclasheun/prompt2.0/course"
	"github.com/niclasheun/prompt2.0/course/courseParticipation"
	"github.com/niclasheun/prompt2.0/coursePhase"
	"github.com/niclasheun/prompt2.0/coursePhase/coursePhaseParticipation"
	db "github.com/niclasheun/prompt2.0/db/sqlc"
	"github.com/niclasheun/prompt2.0/keycloak"
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

	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", dbUser, dbPassword, dbHost, dbPort, dbName, sslMode)
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
	baseURL := utils.GetEnv("KEYCLOAK_BASE_URL", "http://localhost:8081")
	realm := utils.GetEnv("KEYCLOAK_REALM", "prompt")
	clientID := utils.GetEnv("KEYCLOAK_CLIENT_ID", "prompt-server")
	clientSecret := utils.GetEnv("KEYCLOAK_CLIENT_SECRET", "")
	idOfClient := utils.GetEnv("KEYCLOAK_ID_OF_CLIENT", "")

	err := keycloak.InitKeycloak(context.Background(), baseURL, realm, clientID, clientSecret, idOfClient)
	if err != nil {
		log.Error("Failed to initialize keycloak: ", err)
	}
}

func main() {
	// establish database connection
	databaseURL := getDatabaseURL()
	log.Debug("Connecting to database at:", databaseURL)

	// run migrations
	runMigrations(databaseURL)

	// establish db connection
	conn, err := pgx.Connect(context.Background(), databaseURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
		os.Exit(1)
	}
	defer conn.Close(context.Background())

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

	student.InitStudentModule(api, *query, conn)
	course.InitCourseModule(api, *query, conn)
	coursePhase.InitCoursePhaseModule(api, *query, conn)
	courseParticipation.InitCourseParticipationModule(api, *query, conn)
	coursePhaseParticipation.InitCoursePhaseParticipationModule(api, *query, conn)

	serverAddress := utils.GetEnv("SERVER_ADDRESS", "localhost:8080")
	router.Run(serverAddress)
}
