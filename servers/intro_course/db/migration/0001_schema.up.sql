BEGIN;

CREATE TABLE developer_profile (
  course_phase_id uuid NOT NULL,
  course_participation_id uuid NOT NULL,
  gitlab_username   text NOT NULL,
  apple_id         text NOT NULL,
  has_macbook       boolean NOT NULL,
  iphone_uuid       uuid,
  ipad_uuid         uuid,
  apple_watch_uuid  uuid,
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
  PRIMARY KEY (course_phase_id, id)
);

COMMIT;