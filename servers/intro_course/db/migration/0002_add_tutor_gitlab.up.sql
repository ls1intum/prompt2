BEGIN;

ALTER TABLE tutor
  ADD COLUMN gitlab_username text;

COMMIT;
