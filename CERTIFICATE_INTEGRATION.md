# Certificate Phase Integration Guide

This document describes how the Certificate phase has been integrated into the PROMPT 2 platform as a new course phase type.

## Overview

The Certificate phase is a new course phase that allows instructors to:

- Upload certificate templates (Typst format)
- Generate certificates in bulk for students
- Track certificate downloads
- Store certificates in S3-compatible storage (MinIO)

## Architecture

The Certificate phase follows the PROMPT 2 architecture pattern:

### Server Component (`servers/certificate_service/`)

- **Technology**: Go with sqlc for database operations
- **Database**: Separate PostgreSQL instance
- **Storage**: MinIO for templates and generated PDFs
- **Authentication**: PROMPT SDK with Keycloak integration
- **PDF Generation**: Typst compiler

### Client Component (`clients/certificate_component/`)

- **Technology**: React with TypeScript
- **Architecture**: Micro-frontend using Webpack Module Federation
- **UI**: shadcn/ui-style components
- **Port**: 3010 (development)

## Integration Points

### 1. Core Server Registration

The certificate phase type is registered in the core server:

**File**: `servers/core/coursePhaseType/initializeTypes.go`

- Added `initCertificate()` function
- Creates the "Certificate" course phase type
- Defines required inputs (team allocation and team data)
- No provided outputs (typically an end phase)

**File**: `servers/core/coursePhaseType/main.go`

- Added `initCertificate()` call to initialization sequence

**File**: `servers/core/db/query/course_phase_type.sql`

- Added `TestCertificateTypeExists` query

### 2. Core Client Integration

**File**: `clients/core/src/managementConsole/PhaseMapping/PhaseRouterMapping.tsx`

- Added `CertificateRoutes` mapping

**File**: `clients/core/src/managementConsole/PhaseMapping/PhaseSidebarMapping.tsx`

- Added `CertificateSidebar` mapping

**File**: `clients/core/webpack.config.ts`

- Added certificate component as remote module
- Port 3010 for development

### 3. Production Deployment

**File**: `docker-compose.prod.yml`

- Added `server-certificate` service with Traefik routing
- Added `db-certificate` PostgreSQL instance (port 5437)
- Added `minio` service for S3-compatible storage
- Added `client-certificate-component` service
- Environment variables for MinIO and database configuration

**File**: `.env.template`

- Added certificate-specific environment variables:
  - `CERTIFICATE_IMAGE_TAG`
  - `SERVER_CERTIFICATE_IMAGE_TAG`
  - `MINIO_ACCESS_KEY`
  - `MINIO_SECRET_KEY`

## Database Schema

The certificate service uses its own PostgreSQL database with the following schema:

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

## API Endpoints

### Student Endpoints

- `GET /api/certificate/status?courseId={id}` - Get certificate availability status
- `GET /api/certificate/download?studentId={id}` - Download certificate

### Instructor Endpoints (requires lecturer role)

- `GET /api/certificate/students?courseId={id}` - List students and certificate status
- `POST /api/certificate/generate?courseId={id}` - Generate certificates for all students
- `POST /api/certificate/template?courseId={id}` - Upload certificate template
- `GET /api/certificate/template?courseId={id}` - Download certificate template

## Storage

### MinIO Buckets

- `certificates` - Generated PDF certificates
- `certificate-templates` - Typst template files

### File Organization

- Templates: `templates/{courseId}/template.typ`
- Certificates: `{courseId}/{studentId}.pdf`

## Certificate Generation

The service uses Typst for PDF generation with the following workflow:

1. Instructor uploads a `.typ` template file
2. When generating certificates, the service:
   - Fetches the template from MinIO
   - Creates a variables JSON file for each student
   - Runs Typst compiler to generate PDF
   - Uploads PDF to MinIO
   - Updates certificate metadata in database

### Template Variables

Templates receive the following variables:

- `studentName` - Student's full name
- `courseName` - Course title
- `teamName` - Team name
- `date` - Certificate generation date

## Environment Variables

### Database

- `DB_HOST` - Certificate database host
- `DB_PORT` - Database port (5432)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name

### MinIO Storage

- `MINIO_ENDPOINT` - MinIO server endpoint
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `MINIO_BUCKET_NAME` - Bucket for certificates
- `MINIO_TEMPLATE_BUCKET_NAME` - Bucket for templates

### Service

- `PORT` - Service port (8080)
- `CORE_HOST` - Core service URL
- `KEYCLOAK_*` - Authentication configuration

## Development Setup

1. **Start Dependencies**:

   ```bash
   docker run -d --name postgres-cert -e POSTGRES_USER=prompt-postgres -e POSTGRES_PASSWORD=prompt-postgres -e POSTGRES_DB=prompt -p 5432:5432 postgres:15
   docker run -d --name minio-cert -p 9000:9000 -p 9001:9001 -e MINIO_ROOT_USER=minioadmin -e MINIO_ROOT_PASSWORD=minioadmin minio/minio server /data --console-address ":9001"
   ```

2. **Start Certificate Service**:

   ```bash
   cd servers/certificate_service
   go run .
   ```

3. **Start Certificate Client**:

   ```bash
   cd clients/certificate_component
   npm run dev
   ```

## Docker Deployment

The certificate service includes a multi-stage Dockerfile that:

- Builds the Go application
- Installs the migrate tool for database migrations
- Installs Typst compiler for PDF generation
- Creates a minimal Alpine-based runtime image

## Future Improvements

1. **Real Student Data Integration**: Infrastructure is in place in `core_api.go`. Needs service account tokens for production use.
2. **Template Versioning**: Support for multiple template versions per course
3. **Batch Downloads**: Allow instructors to download all certificates as a ZIP
4. **Email Notifications**: Notify students when certificates are ready
5. **Certificate Validation**: Add verification mechanism for generated certificates

## Current Implementation Status

✅ **Completed:**

- Certificate server with sqlc database operations
- Certificate client micro-frontend with React and shadcn/ui
- Core server phase type registration
- Core client integration with module federation
- Docker deployment configuration with dedicated PostgreSQL and MinIO
- Basic certificate generation workflow with Typst
- Template upload and storage
- Download tracking in database
- Mock data implementation for testing

🔄 **In Progress:**

- Real student data integration (infrastructure ready, needs service account tokens)

⏳ **Future Work:**

- Service account authentication for core API calls
- Template versioning system
- Batch download functionality
- Email notifications
- Certificate verification system

## Testing the Integration

1. **Build All Components:**

   ```bash
   # Certificate service
   cd servers/certificate_service && go build .
   
   # Certificate client
   cd clients/certificate_component && npm run build
   
   # Core client (with certificate integration)
   cd clients/core && npm run build
   ```

2. **Run with Docker Compose:**

   ```bash
   cd prompt2
   docker-compose up -d
   ```

3. **Access the Platform:**

   - Navigate to the PROMPT 2 platform
   - Create a course with a Certificate phase
   - Upload a Typst template
   - Generate certificates for students
   - Download and verify generated certificates

## Phase Dependencies

The Certificate phase requires:

- **Team Allocation Data**: To know which teams exist
- **Team Information**: To get team details for certificate generation

This makes it suitable as one of the final phases in a course workflow.
