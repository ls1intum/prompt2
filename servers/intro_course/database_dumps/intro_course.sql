BEGIN;

CREATE TABLE developer_profile (
  course_phase_id uuid NOT NULL,
  course_participation_id uuid NOT NULL,
  gitlab_username text NOT NULL,
  apple_id text NOT NULL,
  has_macbook boolean NOT NULL,
  iphone_udid text,
  ipad_udid text,
  apple_watch_udid text,
  PRIMARY KEY (course_participation_id, course_phase_id)
);

CREATE TABLE tutor (
  course_phase_id uuid NOT NULL,
  id uuid NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  matriculation_number text NOT NULL,
  university_login text NOT NULL,
  gitlab_username text,
  PRIMARY KEY (course_phase_id, id)
);

CREATE TABLE seat (
  course_phase_id uuid NOT NULL,
  seat_name text NOT NULL,
  has_mac boolean NOT NULL DEFAULT false,
  device_id text,
  assigned_student uuid,
  assigned_tutor uuid,
  PRIMARY KEY (seat_name, course_phase_id),
  CONSTRAINT fk_assigned_tutor
    FOREIGN KEY (course_phase_id, assigned_tutor)
    REFERENCES tutor(course_phase_id, id) ON DELETE SET NULL
);

CREATE TABLE student_gitlab_processes (
    course_phase_id uuid NOT NULL,
    course_participation_id uuid NOT NULL,
    gitlab_success BOOLEAN NOT NULL DEFAULT FALSE,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (course_phase_id, course_participation_id)
);

-- Course phase IDs used across tests
-- 4179d58a-d00d-4fa7-94a5-397bc69fab02
-- 5179d58a-d00d-4fa7-94a5-397bc69fab03

INSERT INTO tutor (course_phase_id, id, first_name, last_name, email, matriculation_number, university_login, gitlab_username) VALUES
('4179d58a-d00d-4fa7-94a5-397bc69fab02', '11111111-1111-1111-1111-111111111111', 'Alice', 'Tutor', 'alice@example.com', '100001', 'alice', 'tutor1git'),
('4179d58a-d00d-4fa7-94a5-397bc69fab02', '22222222-2222-2222-2222-222222222222', 'Bob', 'Tutor', 'bob@example.com', '100002', 'bob', NULL);

INSERT INTO developer_profile (course_participation_id, course_phase_id, gitlab_username, apple_id, has_macbook, iphone_udid, ipad_udid, apple_watch_udid) VALUES
('33333333-3333-3333-3333-333333333333', '4179d58a-d00d-4fa7-94a5-397bc69fab02', 'student1git', 'student1@apple.com', TRUE, 'ABCDEF12-34567890ABCDEF12', '11112222-33334444-55556666', 'AAAABBBB-CCCCDDDD-EEEEFFFF'),
('44444444-4444-4444-4444-444444444444', '4179d58a-d00d-4fa7-94a5-397bc69fab02', 'student2git', 'student2@apple.com', TRUE, NULL, NULL, NULL),
('55555555-5555-5555-5555-555555555555', '5179d58a-d00d-4fa7-94a5-397bc69fab03', 'student3git', 'student3@apple.com', FALSE, '12345678-90ABCDEF-12345678', NULL, NULL);

INSERT INTO seat (course_phase_id, seat_name, has_mac, device_id, assigned_student, assigned_tutor) VALUES
('4179d58a-d00d-4fa7-94a5-397bc69fab02', 'Seat-1', TRUE, 'DEV-1', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111'),
('4179d58a-d00d-4fa7-94a5-397bc69fab02', 'Seat-2', FALSE, NULL, '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222');

INSERT INTO student_gitlab_processes (course_phase_id, course_participation_id, gitlab_success, error_message) VALUES
('4179d58a-d00d-4fa7-94a5-397bc69fab02', '33333333-3333-3333-3333-333333333333', TRUE, NULL),
('4179d58a-d00d-4fa7-94a5-397bc69fab02', '44444444-4444-4444-4444-444444444444', FALSE, 'repo creation failed');

COMMIT;
