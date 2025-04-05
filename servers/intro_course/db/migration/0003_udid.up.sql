BEGIN;

-- Alter and rename iphone_uuid to iphone_udid
ALTER TABLE developer_profile
  ALTER COLUMN iphone_uuid TYPE text USING iphone_uuid::text;
ALTER TABLE developer_profile
  RENAME COLUMN iphone_uuid TO iphone_udid;

-- Alter and rename ipad_uuid to ipad_udid
ALTER TABLE developer_profile
  ALTER COLUMN ipad_uuid TYPE text USING ipad_uuid::text;
ALTER TABLE developer_profile
  RENAME COLUMN ipad_uuid TO ipad_udid;

-- Alter and rename apple_watch_uuid to apple_watch_udid
ALTER TABLE developer_profile
  ALTER COLUMN apple_watch_uuid TYPE text USING apple_watch_uuid::text;
ALTER TABLE developer_profile
  RENAME COLUMN apple_watch_uuid TO apple_watch_udid;

COMMIT;
