# Interview Scheduling Implementation

## Overview

This implementation extends the PROMPT Interview component with interview scheduling functionality, allowing instructors to create interview time slots and students to select their preferred interview times.

## Changes Summary

### Backend (Interview Server)

#### New Files Created

- **`servers/interview/main.go`**: Main server file based on template_server
- **`servers/interview/go.mod`**: Go module configuration
- **`servers/interview/sqlc.yaml`**: SQL code generation configuration
- **`servers/interview/README.md`**: Server documentation

#### Utilities

- **`servers/interview/utils/getCoreUrl.go`**: Helper to get core server URL
- **`servers/interview/utils/getEnv.go`**: Environment variable helper

#### Configuration & Copy Modules

- **`servers/interview/config/`**: Phase configuration module (main.go, router.go, service.go)
- **`servers/interview/copy/`**: Phase copy module (main.go, router.go, service.go)

#### Interview Slot Module

- **`servers/interview/interview_slot/main.go`**: Module initialization
- **`servers/interview/interview_slot/router.go`**: API routes for slots and assignments
- **`servers/interview/interview_slot/service.go`**: Business logic for CRUD operations

#### Database

- **`servers/interview/db/migration/0001_interview_slots.up.sql`**:
  - `interview_slot` table: Stores time slots with start/end times, location, capacity
  - `interview_assignment` table: Links students to booked slots
  - Indexes for performance optimization

- **`servers/interview/db/query/interview_slot.sql`**: SQL queries for:
  - Creating, reading, updating, deleting slots
  - Creating and managing assignments
  - Counting assignments per slot
  - Fetching slots with assignment details

### Frontend (Interview Component)

#### Route Restructuring

- **`clients/interview_component/routes/index.tsx`**:
  - Root path (`/`) now shows student-facing page
  - Admin pages moved under `/manage` and `/schedule`
  - All users can now access the component

#### New Pages

- **`clients/interview_component/src/interview/pages/StudentInterview/StudentInterviewPage.tsx`**:
  - Student view to browse available interview slots
  - Visual slot cards with date, time, location, capacity info
  - Booking and cancellation functionality
  - Current booking status display

- **`clients/interview_component/src/interview/pages/ScheduleManagement/InterviewScheduleManagement.tsx`**:
  - Instructor page to create, edit, delete interview slots
  - Table view of all slots with status indicators
  - Modal dialogs for creating/editing slots
  - Real-time capacity tracking

#### Updated Files

- **`clients/interview_component/sidebar/index.tsx`**:
  - Updated navigation to include new pages
  - Made interview accessible to all roles

### Infrastructure

#### Docker Compose

- **`docker-compose.yml`**:
  - Added `server-interview` service on port 8087
  - Added `db-interview` PostgreSQL database on port 5438
  - Configured with proper dependencies and health checks

#### Environment Configuration

- **`.env.template`**:
  - Added interview database configuration variables
  - Added Sentry DSN for interview service
  - Added legacy compatibility mappings

#### Core Server

- **`servers/core/coursePhaseType/initializeTypes.go`**:
  - Updated `initInterview()` to point to interview microservice
  - Changed base URL from "core" to interview-service
  - Updated description to reflect scheduling functionality

## API Endpoints

### Admin Endpoints

- `POST /interview-service/api/course_phase/:coursePhaseID/interview-slots` - Create slot
- `GET /interview-service/api/course_phase/:coursePhaseID/interview-slots` - List all slots
- `GET /interview-service/api/course_phase/:coursePhaseID/interview-slots/:slotId` - Get specific slot
- `PUT /interview-service/api/course_phase/:coursePhaseID/interview-slots/:slotId` - Update slot
- `DELETE /interview-service/api/course_phase/:coursePhaseID/interview-slots/:slotId` - Delete slot

### Student Endpoints

- `POST /interview-service/api/course_phase/:coursePhaseID/interview-assignments` - Book a slot
- `GET /interview-service/api/course_phase/:coursePhaseID/interview-assignments/my-assignment` - Get current booking
- `DELETE /interview-service/api/course_phase/:coursePhaseID/interview-assignments/:assignmentId` - Cancel booking

## Database Schema

### interview_slot Table

- `id` (UUID): Primary key
- `course_phase_id` (UUID): Links to course phase
- `start_time` (timestamptz): Interview start time
- `end_time` (timestamptz): Interview end time
- `location` (varchar): Optional location information
- `capacity` (integer): Maximum number of students
- `created_at`, `updated_at` (timestamptz): Timestamps

### interview_assignment Table

- `id` (UUID): Primary key
- `interview_slot_id` (UUID): Foreign key to interview_slot
- `course_participation_id` (UUID): Links to student participation
- `assigned_at` (timestamptz): Booking timestamp
- Unique constraint on (course_participation_id, interview_slot_id)

## Features

### For Students

- View all available interview time slots
- See real-time availability and capacity
- Book an available slot
- View current booking details (date, time, location)
- Cancel existing booking
- Visual indicators for full/past slots

### For Instructors

- Create multiple interview time slots
- Set start/end times, location, and capacity
- Edit existing slots
- Delete slots (removes all associated bookings)
- View slot status (available/full/past)
- Track assignment counts per slot
- Manage schedule through intuitive table interface

## User Experience Improvements

1. **Student-First Design**: Interview component now defaults to student view
2. **Clear Navigation**: Sidebar updated with logical grouping of admin vs. student pages
3. **Visual Feedback**: Color-coded badges for slot status (available/full/past)
4. **Responsive Design**: Works across desktop and mobile devices
5. **Real-Time Updates**: React Query automatically refreshes data after mutations
6. **Error Handling**: Clear error messages and validation

## Next Steps for Development

To start using the interview scheduling feature:

1. **Start Services**:

   ```bash
   # Start database and interview server
   docker-compose up db-interview server-interview

   # Or start everything
   docker-compose up
   ```

2. **Access the Feature**:
   - Students: Navigate to Interview phase in course
   - Instructors: Use "Schedule" menu item to manage slots

3. **Testing**:
   - Run Go tests: `cd servers/interview && go test ./...`
   - Test API with curl or Postman
   - Test UI in development mode: `cd clients && yarn run dev`

## Architecture Highlights

- **Microservice Pattern**: Independent interview server with dedicated database
- **Type Safety**: sqlc generates type-safe Go code from SQL
- **Authentication**: Keycloak integration via prompt-sdk
- **Authorization**: Role-based access control (admin vs. student endpoints)
- **Data Integrity**: Foreign key constraints and unique constraints
- **Scalability**: Can handle multiple concurrent bookings with database constraints
- **Modularity**: Easy to extend with additional features (e.g., email notifications, calendar integration)

## Notes

- The interview server uses port 8087 by default
- Database migrations run automatically on server startup
- The system prevents double-booking via unique constraints
- Capacity is enforced at the application level before creating assignments
- Students can only have one active interview booking at a time
