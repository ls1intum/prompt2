BEGIN;

ALTER TABLE category
ADD COLUMN short_name VARCHAR(10) DEFAULT 'default';

ALTER TABLE competency
ADD COLUMN short_name VARCHAR(10) DEFAULT 'default';

COMMIT;