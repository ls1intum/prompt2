BEGIN;

ALTER TABLE category
ADD COLUMN short_name VARCHAR(10) DEFAULT 'N/A';

ALTER TABLE competency
ADD COLUMN short_name VARCHAR(10) DEFAULT 'N/A';

COMMIT;