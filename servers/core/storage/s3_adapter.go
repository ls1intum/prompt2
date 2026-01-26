package storage

import (
	"context"
	"fmt"
	"io"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

// S3Adapter implements the StorageAdapter interface using AWS S3 or compatible services
// Compatible with AWS S3, SeaweedFS S3 gateway, MinIO, and other S3-compatible storage
type S3Adapter struct {
	client          *s3.Client
	bucket          string
	forcePathStyle  bool
	presignDuration time.Duration
}

// NewS3Adapter creates a new S3 storage adapter
// Works with AWS S3, SeaweedFS S3 gateway, MinIO, and other S3-compatible services
func NewS3Adapter(bucket, region, endpoint, accessKey, secretKey string, forcePathStyle bool) (*S3Adapter, error) {
	ctx := context.Background()
	var cfg aws.Config
	var err error

	if endpoint != "" {
		// Custom endpoint (SeaweedFS, MinIO, etc.)
		customResolver := aws.EndpointResolverWithOptionsFunc(func(service, region string, options ...interface{}) (aws.Endpoint, error) {
			return aws.Endpoint{
				URL:               endpoint,
				SigningRegion:     region,
				HostnameImmutable: true,
			}, nil
		})

		cfg, err = config.LoadDefaultConfig(ctx,
			config.WithRegion(region),
			config.WithEndpointResolverWithOptions(customResolver),
			config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
		)
	} else {
		// AWS S3
		cfg, err = config.LoadDefaultConfig(ctx,
			config.WithRegion(region),
			config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")),
		)
	}

	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.UsePathStyle = forcePathStyle
	})

	log.WithFields(log.Fields{
		"bucket":         bucket,
		"region":         region,
		"endpoint":       endpoint,
		"forcePathStyle": forcePathStyle,
	}).Info("S3 adapter initialized")

	return &S3Adapter{
		client:          client,
		bucket:          bucket,
		forcePathStyle:  forcePathStyle,
		presignDuration: 15 * time.Minute, // Default presign duration
	}, nil
}

// Upload stores a file in S3
func (s *S3Adapter) Upload(ctx context.Context, filename string, contentType string, reader io.Reader) (*UploadResult, error) {
	// Generate unique key
	key := fmt.Sprintf("%s/%s", uuid.New().String(), filename)

	// Upload to S3
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        reader,
		ContentType: aws.String(contentType),
	})

	if err != nil {
		log.WithError(err).WithField("key", key).Error("Failed to upload file to S3")
		return nil, fmt.Errorf("failed to upload to S3: %w", err)
	}

	// Get object size
	head, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})

	var size int64
	if err == nil && head.ContentLength != nil {
		size = *head.ContentLength
	}

	log.WithFields(log.Fields{
		"key":  key,
		"size": size,
	}).Info("File uploaded to S3 successfully")

	return &UploadResult{
		StorageKey: key,
		PublicURL:  fmt.Sprintf("%s/%s", s.bucket, key), // Note: This is not a real URL, just the key
		Size:       size,
	}, nil
}

// Download retrieves a file from S3
func (s *S3Adapter) Download(ctx context.Context, storageKey string) (io.ReadCloser, error) {
	result, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(storageKey),
	})

	if err != nil {
		log.WithError(err).WithField("key", storageKey).Error("Failed to download file from S3")
		return nil, fmt.Errorf("failed to download from S3: %w", err)
	}

	return result.Body, nil
}

// Delete removes a file from S3
func (s *S3Adapter) Delete(ctx context.Context, storageKey string) error {
	_, err := s.client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(storageKey),
	})

	if err != nil {
		log.WithError(err).WithField("key", storageKey).Error("Failed to delete file from S3")
		return fmt.Errorf("failed to delete from S3: %w", err)
	}

	log.WithField("key", storageKey).Info("File deleted from S3 successfully")
	return nil
}

// GetURL returns a presigned URL for accessing the file
func (s *S3Adapter) GetURL(ctx context.Context, storageKey string, ttl int) (string, error) {
	duration := s.presignDuration
	if ttl > 0 {
		duration = time.Duration(ttl) * time.Second
	}

	presignClient := s3.NewPresignClient(s.client)
	request, err := presignClient.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(storageKey),
	}, func(opts *s3.PresignOptions) {
		opts.Expires = duration
	})

	if err != nil {
		log.WithError(err).WithField("key", storageKey).Error("Failed to generate presigned URL")
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	return request.URL, nil
}

// GetMetadata retrieves metadata about a file
func (s *S3Adapter) GetMetadata(ctx context.Context, storageKey string) (*FileMetadata, error) {
	head, err := s.client.HeadObject(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(storageKey),
	})

	if err != nil {
		log.WithError(err).WithField("key", storageKey).Error("Failed to get file metadata from S3")
		return nil, fmt.Errorf("failed to get metadata from S3: %w", err)
	}

	contentType := ""
	if head.ContentType != nil {
		contentType = *head.ContentType
	}

	size := int64(0)
	if head.ContentLength != nil {
		size = *head.ContentLength
	}

	return &FileMetadata{
		StorageKey:  storageKey,
		Filename:    storageKey, // S3 key is the filename
		ContentType: contentType,
		Size:        size,
	}, nil
}
