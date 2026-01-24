package main

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"time"

	"github.com/getsentry/sentry-go"
	sentrygin "github.com/getsentry/sentry-go/gin"
	sentrylogrus "github.com/getsentry/sentry-go/logrus"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	promptSDK "github.com/ls1intum/prompt-sdk"
	sdkUtils "github.com/ls1intum/prompt-sdk/utils"
	"github.com/ls1intum/prompt2/servers/interview/config"
	"github.com/ls1intum/prompt2/servers/interview/copy"
	db "github.com/ls1intum/prompt2/servers/interview/db/sqlc"
	"github.com/ls1intum/prompt2/servers/interview/interview_slot"
	log "github.com/sirupsen/logrus"
)

var dbUser string = promptSDK.GetEnv("DB_USER", "prompt-postgres")
var dbPassword string = promptSDK.GetEnv("DB_PASSWORD", "prompt-postgres")
var dbHost string = promptSDK.GetEnv("DB_HOST_INTERVIEW", "localhost")
var dbPort string = promptSDK.GetEnv("DB_PORT_INTERVIEW", "5438")
var dbName string = promptSDK.GetEnv("DB_NAME", "prompt")
var sslMode string = promptSDK.GetEnv("SSL_MODE", "disable")
var timeZone string = promptSDK.GetEnv("DB_TIMEZONE", "Europe/Berlin")

func getDatabaseURL() string {
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

func initSentry() {
	sentryDsn := promptSDK.GetEnv("SENTRY_DSN_INTERVIEW", "")
	if sentryDsn == "" {
		log.Info("Sentry DSN not configured, skipping initialization")
		return
	}

	transport := sentry.NewHTTPTransport()
	transport.Timeout = 2 * time.Second

	if err := sentry.Init(sentry.ClientOptions{
		Dsn:              sentryDsn,
		Environment:      promptSDK.GetEnv("ENVIRONMENT", "development"),
		Debug:            false,
		Transport:        transport,
		EnableLogs:       true,
		AttachStacktrace: true,
		SendDefaultPII:   true,
		EnableTracing:    true,
		TracesSampleRate: 1.0,
	}); err != nil {
		log.Errorf("Sentry initialization failed: %v", err)
		return
	}

	client := sentry.CurrentHub().Client()
	if client == nil {
		log.Error("Sentry client is nil")
		return
	}

	logHook := sentrylogrus.NewLogHookFromClient(
		[]log.Level{log.InfoLevel, log.WarnLevel},
		client,
	)

	eventHook := sentrylogrus.NewEventHookFromClient(
		[]log.Level{log.ErrorLevel, log.FatalLevel, log.PanicLevel},
		client,
	)

	log.AddHook(logHook)
	log.AddHook(eventHook)

	log.RegisterExitHandler(func() {
		eventHook.Flush(5 * time.Second)
		logHook.Flush(5 * time.Second)
	})

	log.Info("Sentry initialized successfully")
}

func initKeycloak(queries db.Queries) {
	baseURL := promptSDK.GetEnv("KEYCLOAK_HOST", "http://localhost:8081")
	if !strings.HasPrefix(baseURL, "http") {
		log.Warn("Keycloak host does not start with http(s). Adding https:// as prefix.")
		baseURL = "https://" + baseURL
	}

	realm := promptSDK.GetEnv("KEYCLOAK_REALM_NAME", "prompt")

	coreURL := sdkUtils.GetCoreUrl()
	err := promptSDK.InitAuthenticationMiddleware(baseURL, realm, coreURL)
	if err != nil {
		log.Fatalf("Failed to initialize keycloak: %v", err)
	}
}

func main() {
	initSentry()
	defer sentry.Flush(2 * time.Second)

	databaseURL := getDatabaseURL()
	log.Debugf("Connecting to database at host=%s port=%s db=%s user=%s sslmode=%s", dbHost, dbPort, dbName, dbUser, sslMode)

	runMigrations(databaseURL)

	conn, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v\n", err)
	}
	defer conn.Close()

	query := db.New(conn)

	clientHost := promptSDK.GetEnv("CORE_HOST", "http://localhost:3000")

	router := gin.Default()
	router.Use(sentrygin.New(sentrygin.Options{}))
	router.Use(promptSDK.CORSMiddleware(clientHost))

	api := router.Group("interview-service/api/course_phase/:coursePhaseID")
	initKeycloak(*query)

	api.GET("/hello", helloInterviewServer)

	copyApi := router.Group("interview-service/api")
	copy.InitCopyModule(copyApi, *query, conn)

	config.InitConfigModule(api, *query, conn)

	interview_slot.InitInterviewSlotModule(api, *query, conn)

	serverAddress := promptSDK.GetEnv("SERVER_ADDRESS", "localhost:8087")
	log.Info("Interview Server started")
	err = router.Run(serverAddress)
	if err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func helloInterviewServer(c *gin.Context) {
	c.JSON(200, gin.H{
		"message": "Hello from the interview service",
	})
}
