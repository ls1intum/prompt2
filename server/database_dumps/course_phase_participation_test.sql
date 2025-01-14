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
-- Name: pass_status; Type: TYPE; Schema: public; Owner: prompt-postgres
--

CREATE TYPE pass_status AS ENUM ('passed', 'failed', 'not_assessed');

--
-- Name: course_phase_participation; Type: TABLE; Schema: public; Owner: prompt-postgres
--

CREATE TABLE course_phase_participation (
    id uuid NOT NULL,
    course_participation_id uuid NOT NULL,
    course_phase_id uuid NOT NULL,
    pass_status pass_status DEFAULT 'not_assessed',
    meta_data jsonb
);

--
-- Data for Name: course_phase_participation; Type: TABLE DATA; Schema: public; Owner: prompt-postgres
--

INSERT INTO course_phase_participation (id, course_participation_id, course_phase_id, pass_status, meta_data)
VALUES 
('7cd22e70-34b6-4416-8c1a-54f899a35951', '6e19bab2-53d0-4b6a-ac02-33b23988401a', '3d1f3b00-87f3-433b-a713-178c4050411b', 'failed', '{}'),
('71b5eff0-c3b7-4495-b37b-65fc211b4b69', '8713d7bc-1542-4366-88a9-1fa50945b052', '3d1f3b00-87f3-433b-a713-178c4050411b', 'failed', '{}'),
('ba42a9bb-2130-45f2-9522-65d23501ef7c', '0e762fdd-c4fa-49f4-9c38-c90160cc6caa', '3d1f3b00-87f3-433b-a713-178c4050411b', 'failed', '{}'),
('2c1d802c-f7c3-4ba0-b95f-f6a3edf91940', '0e762fdd-c4fa-49f4-9c38-c90160cc6caa', '500db7ed-2eb2-42d0-82b3-8750e12afa8a', 'failed', '{}'),
('ed30f4b3-73e9-4867-a148-7d0c9cdef451', '6e19bab2-53d0-4b6a-ac02-33b23988401a', '500db7ed-2eb2-42d0-82b3-8750e12afa8a', 'failed', '{}'),
('7698f081-df55-4136-a58c-1a166bb1bbda', '8713d7bc-1542-4366-88a9-1fa50945b052', '500db7ed-2eb2-42d0-82b3-8750e12afa8a', 'failed', '{"skills": "none"}');

CREATE TABLE course_participation (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    student_id uuid NOT NULL
);


--
-- Data for Name: course_participation; Type: TABLE DATA; Schema: public; Owner: prompt-postgres
--

INSERT INTO course_participation (id, course_id, student_id) VALUES ('6e19bab2-53d0-4b6a-ac02-33b23988401a', '3f42d322-e5bf-4faa-b576-51f2cab14c2e', '3a774200-39a7-4656-bafb-92b7210a93c1');
INSERT INTO course_participation (id, course_id, student_id) VALUES ('8713d7bc-1542-4366-88a9-1fa50945b052', '3f42d322-e5bf-4faa-b576-51f2cab14c2e', '7dc1c4e8-4255-4874-80a0-0c12b958744b');
INSERT INTO course_participation (id, course_id, student_id) VALUES ('0e762fdd-c4fa-49f4-9c38-c90160cc6caa', '3f42d322-e5bf-4faa-b576-51f2cab14c2e', '500db7ed-2eb2-42d0-82b3-8750e12afa8b');
INSERT INTO course_participation (id, course_id, student_id) VALUES ('65dcc535-a9ab-4421-a2bc-0f09780ca59e', '918977e1-2d27-4b55-9064-8504ff027a1a', '500db7ed-2eb2-42d0-82b3-8750e12afa8b');
INSERT INTO course_participation (id, course_id, student_id) VALUES ('ec679792-f9e1-423c-80fa-a9f3324fefa8', '918977e1-2d27-4b55-9064-8504ff027a1a', '7dc1c4e8-4255-4874-80a0-0c12b958744b');
INSERT INTO course_participation (id, course_id, student_id) VALUES ('9f061396-e208-4b00-bc8c-f3a04bc0a212', '918977e1-2d27-4b55-9064-8504ff027a1a', '7dc1c4e8-4255-4874-80a0-0c12b958744a');


CREATE type gender as enum ('male', 'female', 'diverse', 'prefer_not_to_say');

CREATE TABLE student (
    id uuid NOT NULL,
    first_name character varying(50),
    last_name character varying(50),
    email character varying(255),
    matriculation_number character varying(30),
    university_login character varying(20),
    has_university_account boolean,
    gender gender NOT NULL
);


--
-- Data for Name: student; Type: TABLE DATA; Schema: public; Owner: prompt-postgres
--

INSERT INTO student (id, first_name, last_name, email, matriculation_number, university_login, has_university_account, gender)
VALUES ('3a774200-39a7-4656-bafb-92b7210a93c1', 'Niclas', 'Heun', 'niclas.heun@tum.de', '03711126', 'ge25hok', true, 'male');


--

-- PostgreSQL database dump complete
--


ALTER TABLE student
    ADD COLUMN nationality VARCHAR(2);

CREATE TYPE study_degree AS ENUM (
  'bachelor',
  'master'
);

ALTER TABLE student
ADD COLUMN study_program varchar(100),
ADD COLUMN study_degree study_degree NOT NULL DEFAULT 'bachelor',
ADD COLUMN current_semester int,
ADD COLUMN last_modified timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE course_phase_participation
ADD COLUMN last_modified timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;


-- Create the function to update the last_modified column
CREATE OR REPLACE FUNCTION update_last_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_modified = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update last_modified
CREATE TRIGGER set_last_modified_student
BEFORE UPDATE ON student
FOR EACH ROW
EXECUTE FUNCTION update_last_modified_column();

CREATE TRIGGER set_last_modified_course_phase_participation
BEFORE UPDATE ON course_phase_participation
FOR EACH ROW
EXECUTE FUNCTION update_last_modified_column();

CREATE TABLE course_phase (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    name text,
    meta_data jsonb,
    is_initial_phase boolean NOT NULL,
    course_phase_type_id uuid NOT NULL
);

--
-- Data for Name: course_phase; Type: TABLE DATA; Schema: public; Owner: prompt-postgres
--

INSERT INTO course_phase (id, course_id, name, meta_data, is_initial_phase, course_phase_type_id) VALUES ('4179d58a-d00d-4fa7-94a5-397bc69fab02', 'be780b32-a678-4b79-ae1c-80071771d254', 'Dev Application', '{"applicationEndDate": "2030-01-18T00:00:00.000Z", "applicationStartDate": "2024-12-24T00:00:00.000Z", "externalStudentsAllowed": false}', true, '96fb1001-b21c-4527-8b6f-2fd5f4ba3abc');
INSERT INTO course_phase (id, course_id, name, meta_data, is_initial_phase, course_phase_type_id) VALUES ('7062236a-e290-487c-be41-29b24e0afc64', 'e12ffe63-448d-4469-a840-1699e9b328d1', 'New Team Phase', '{}', false, '627b6fb9-2106-4fce-ba6d-b68eeb546382');
INSERT INTO course_phase (id, course_id, name, meta_data, is_initial_phase, course_phase_type_id) VALUES ('e12ffe63-448d-4469-a840-1699e9b328d3', 'e12ffe63-448d-4469-a840-1699e9b328d1', 'Intro Course', '{}', false, '48d22f19-6cc0-417b-ac25-415fb40f2030');


CREATE TABLE course_phase_graph (
    from_course_phase_id uuid NOT NULL,
    to_course_phase_id uuid NOT NULL
);

CREATE TABLE course_phase_type (
    id uuid NOT NULL,
    name text NOT NULL,
    required_input_meta_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    provided_output_meta_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    initial_phase boolean DEFAULT false NOT NULL
);

CREATE TABLE application_assessment (
    id uuid NOT NULL,
    course_phase_participation_id uuid NOT NULL,
    score integer
);

CREATE TABLE meta_data_dependency_graph (
    from_phase_id uuid NOT NULL,
    to_phase_id   uuid NOT NULL,
    PRIMARY KEY (from_phase_id, to_phase_id)
);
