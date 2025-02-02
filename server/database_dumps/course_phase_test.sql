--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.8 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', 'public', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: course_phase; Type: TABLE; Schema: public; Owner: prompt-postgres
--

CREATE TABLE course_phase_type (
    id uuid NOT NULL,
    name text NOT NULL
);


CREATE TABLE course_phase (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    name text,
    meta_data jsonb,
    is_initial_phase boolean NOT NULL,
    course_phase_type_id uuid NOT NULL
);

INSERT INTO course_phase_type (id, name) VALUES ('7dc1c4e8-4255-4874-80a0-0c12b958744b', 'application');
INSERT INTO course_phase_type (id, name) VALUES ('7dc1c4e8-4255-4874-80a0-0c12b958744c', 'template_component');


--
-- Data for Name: course_phase; Type: TABLE DATA; Schema: public; Owner: prompt-postgres
--

INSERT INTO course_phase (id, course_id, name, meta_data, is_initial_phase, course_phase_type_id) VALUES ('3d1f3b00-87f3-433b-a713-178c4050411b', '3f42d322-e5bf-4faa-b576-51f2cab14c2e', 'Test', '{"test-key":"test-value"}', false, '7dc1c4e8-4255-4874-80a0-0c12b958744b');
INSERT INTO course_phase (id, course_id, name, meta_data, is_initial_phase, course_phase_type_id) VALUES ('92bb0532-39e5-453d-bc50-fa61ea0128b2', '3f42d322-e5bf-4faa-b576-51f2cab14c2e', 'Template Phase', '{}', false, '7dc1c4e8-4255-4874-80a0-0c12b958744c');
INSERT INTO course_phase (id, course_id, name, meta_data, is_initial_phase, course_phase_type_id) VALUES ('500db7ed-2eb2-42d0-82b3-8750e12afa8a', '3f42d322-e5bf-4faa-b576-51f2cab14c2e', 'Application Phase', '{}', true, '7dc1c4e8-4255-4874-80a0-0c12b958744b');

ALTER TABLE ONLY course_phase
    ADD CONSTRAINT course_phase_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX unique_initial_phase_per_course ON course_phase USING btree (course_id) WHERE (is_initial_phase = true);

ALTER TABLE ONLY course_phase_type
    ADD CONSTRAINT course_phase_type_name_key UNIQUE (name);

ALTER TABLE ONLY course_phase_type
    ADD CONSTRAINT course_phase_type_pkey PRIMARY KEY (id);

ALTER TABLE ONLY course_phase
    ADD CONSTRAINT fk_phase_type FOREIGN KEY (course_phase_type_id) REFERENCES public.course_phase_type(id);



ALTER TABLE course_phase
RENAME COLUMN meta_data TO restricted_data;

ALTER TABLE course_phase
ADD COLUMN student_readable_data jsonb DEFAULT '{}';