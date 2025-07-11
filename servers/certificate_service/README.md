# Certificate Service

A microservice for generating and managing course completion certificates in the PROMPT platform.

## Features

- Upload and manage certificate templates (Typst format)
- Generate certificates in bulk for all students in a course
- Download certificates for students and instructors
- Track certificate downloads
- S3-compatible storage (MinIO) integration

## Architecture

- **Server**: Go service using sqlc for database operations
- **Client**: React micro-frontend with TypeScript and shadcn/ui components
- **Database**: PostgreSQL for certificate metadata
- **Storage**: MinIO for templates and generated PDFs
- **Template Engine**: Typst for PDF generation

## Development Setup

### Prerequisites

- Go 1.24+
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL
- MinIO
- Typst compiler
- golang-migrate CLI tool

### Environment Variables

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=prompt-postgres
DB_PASSWORD=prompt-postgres
DB_NAME=prompt
SSL_MODE=disable
DB_TIMEZONE=Europe/Berlin

# MinIO Storage
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=certificates
MINIO_TEMPLATE_BUCKET_NAME=certificate-templates

# Service
PORT=8080
CORE_HOST=http://localhost:3000

# Keycloak
KEYCLOAK_URL=http://localhost:8282
KEYCLOAK_REALM=prompt
KEYCLOAK_CLIENT_ID=prompt-client
```

### Database Setup

1. Run migrations:
```bash
cd servers/certificate_service
migrate -path ./db/migration -database "postgres://prompt-postgres:prompt-postgres@localhost:5432/prompt?sslmode=disable" up
```

2. Generate sqlc code:
```bash
sqlc generate
```

### Server Development

```bash
cd servers/certificate_service

# Install dependencies
go mod download

# Build and run
go build .
./certificate-service
```

### Client Development

```bash
cd clients/certificate_component

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build
```

### Docker Development

Start all services with MinIO:

```bash
cd prompt2
docker-compose up -d minio certificate-service
```

## API Endpoints

### Student Endpoints
- `GET /api/certificate/status?courseId={id}` - Get certificate availability status
- `GET /api/certificate/download?studentId={id}` - Download certificate

### Instructor Endpoints (requires lecturer role)
- `GET /api/certificate/students?courseId={id}` - List students and certificate status
- `POST /api/certificate/generate?courseId={id}` - Generate certificates for all students
- `POST /api/certificate/template?courseId={id}` - Upload certificate template
- `GET /api/certificate/template?courseId={id}` - Download certificate template

## Template Format

Certificate templates use the Typst format. The template should include variables for:

- `studentName` - Student's full name
- `courseName` - Course title
- `teamName` - Team name
- `date` - Certificate generation date

Example template:
```typst
#let vars = json("vars.json")

#align(center)[
  #text(size: 24pt, weight: "bold")[Certificate of Completion]
  
  #text(size: 20pt)[#vars.studentName]
  
  #text(size: 18pt)[#vars.courseName]
]
```

## Database Schema

The service uses a single table `certificate_metadata`:

```sql
CREATE TABLE certificate_metadata (
    id                  SERIAL PRIMARY KEY,
    student_id          uuid NOT NULL,
    course_id           uuid NOT NULL,
    generated_at        timestamp with time zone NOT NULL DEFAULT NOW(),
    last_download       timestamp with time zone,
    download_count      integer NOT NULL DEFAULT 0,
    certificate_url     text NOT NULL,
    
    CONSTRAINT idx_certificate_metadata_student_course UNIQUE (student_id, course_id)
);
```

## Deployment

The service is containerized and can be deployed using the provided Dockerfile. Make sure to:

1. Set all required environment variables
2. Ensure database migrations are run
3. Configure MinIO buckets
4. Install Typst compiler in the container

## Limitations

- Currently uses mock student data for certificate generation
- Student/team information needs to be fetched from the core service API
- Templates are stored per course but not versioned

## Future Improvements

- Integration with core service API for student data
- Template versioning
- Batch download functionality
- Certificate validation/verification
- Email notifications when certificates are ready
