package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/exec"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/ls1intum/prompt-sdk/keycloakTokenVerifier"
	"github.com/ls1intum/prompt-sdk/utils"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	db "github.com/prompt/certificate-service/db/sqlc"
)

type Server struct {
	minioClient *minio.Client
	queries     *db.Queries
}

func getDatabaseURL() string {
	dbUser := utils.GetEnv("DB_USER", "prompt-postgres")
	dbPassword := utils.GetEnv("DB_PASSWORD", "prompt-postgres")
	dbHost := utils.GetEnv("DB_HOST", "localhost")
	dbPort := utils.GetEnv("DB_PORT", "5432")
	dbName := utils.GetEnv("DB_NAME", "prompt")
	sslMode := utils.GetEnv("SSL_MODE", "disable")
	timeZone := utils.GetEnv("DB_TIMEZONE", "Europe/Berlin")

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

func main() {
	// Initialize Database connection
	databaseURL := getDatabaseURL()
	log.Printf("Connecting to database at: %s", databaseURL)

	// Run migrations
	runMigrations(databaseURL)

	// Establish db connection
	conn, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v\n", err)
	}
	defer conn.Close()

	queries := db.New(conn)

	// Initialize MinIO client
	minioClient, err := minio.New(os.Getenv("MINIO_ENDPOINT"), &minio.Options{
		Creds:  credentials.NewStaticV4(os.Getenv("MINIO_ACCESS_KEY"), os.Getenv("MINIO_SECRET_KEY"), ""),
		Secure: false,
	})
	if err != nil {
		log.Fatalf("Failed to create MinIO client: %v", err)
	}

	// Create buckets if they don't exist
	ctx := context.Background()
	bucketName := os.Getenv("MINIO_BUCKET_NAME")
	templateBucketName := os.Getenv("MINIO_TEMPLATE_BUCKET_NAME")

	for _, bucket := range []string{bucketName, templateBucketName} {
		exists, err := minioClient.BucketExists(ctx, bucket)
		if err != nil {
			log.Fatalf("Failed to check bucket existence: %v", err)
		}
		if !exists {
			err = minioClient.MakeBucket(ctx, bucket, minio.MakeBucketOptions{})
			if err != nil {
				log.Fatalf("Failed to create bucket: %v", err)
			}
		}
	}

	// Initialize Gin router
	r := gin.Default()
	r.Use(utils.CORS(os.Getenv("CORE_HOST")))
	r.Use(keycloakTokenVerifier.AuthenticationMiddleware())

	server := &Server{
		minioClient: minioClient,
		queries:     queries,
	}

	// Routes
	api := r.Group("/api/certificate")
	{
		// Student endpoints
		api.GET("/status", server.GetCertificateStatus)
		api.GET("/download", server.DownloadCertificate)

		// Instructor endpoints
		instructorAPI := api.Group("/", keycloakTokenVerifier.AuthenticationMiddleware(keycloakTokenVerifier.CourseLecturer))
		{
			instructorAPI.GET("/students", server.ListStudents)
			instructorAPI.POST("/generate", server.GenerateCertificates)
			instructorAPI.POST("/template", server.UploadTemplate)
			instructorAPI.GET("/template", server.GetTemplate)
		}
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
