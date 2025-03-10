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

COMMIT;