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
-- Name: course_phase_type; Type: TABLE; Schema: public; Owner: prompt-postgres
--

CREATE TABLE course_phase_type (
    id uuid NOT NULL,
    name text NOT NULL,
    required_input_meta_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    provided_output_meta_data jsonb DEFAULT '{}'::jsonb NOT NULL,
    initial_phase boolean DEFAULT false NOT NULL
);

--
-- Data for Name: course_phase_type; Type: TABLE DATA; Schema: public; Owner: prompt-postgres
--

INSERT INTO course_phase_type (id, name, required_input_meta_data, provided_output_meta_data, initial_phase) VALUES ('48d22f19-6cc0-417b-ac25-415fb40f2030', 'Intro Course', '[{"name": "hasOwnMac", "type": "boolean"}]', '[{"name": "proficiency level", "type": "string"}]', false);
INSERT INTO course_phase_type (id, name, required_input_meta_data, provided_output_meta_data, initial_phase) VALUES ('96fb1001-b21c-4527-8b6f-2fd5f4ba3abc', 'Application', '[]', '[{"name": "hasOwnMac", "type": "boolean"}, {"name": "devices", "type": "array"}]', true);
INSERT INTO course_phase_type (id, name, required_input_meta_data, provided_output_meta_data, initial_phase) VALUES ('627b6fb9-2106-4fce-ba6d-b68eeb546382', 'Team Phase', '[{"name": "proficiency level", "type": "string"}, {"name": "devices", "type": "array"}]', '[]', false);


--
-- Name: course_phase_type course_phase_type_name_key; Type: CONSTRAINT; Schema: public; Owner: prompt-postgres
--

ALTER TABLE ONLY course_phase_type
    ADD CONSTRAINT course_phase_type_name_key UNIQUE (name);


--
-- Name: course_phase_type course_phase_type_pkey; Type: CONSTRAINT; Schema: public; Owner: prompt-postgres
--

ALTER TABLE ONLY course_phase_type
    ADD CONSTRAINT course_phase_type_pkey PRIMARY KEY (id);


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

INSERT INTO course_phase (id, course_id, name, meta_data, is_initial_phase, course_phase_type_id) VALUES ('4179d58a-d00d-4fa7-94a5-397bc69fab02', 'be780b32-a678-4b79-ae1c-80071771d254', 'Dev Application', '{"applicationEndDate": "2025-01-18T00:00:00.000Z", "applicationStartDate": "2024-12-24T00:00:00.000Z", "externalStudentsAllowed": false}', true, '96fb1001-b21c-4527-8b6f-2fd5f4ba3abc');
INSERT INTO course_phase (id, course_id, name, meta_data, is_initial_phase, course_phase_type_id) VALUES ('7062236a-e290-487c-be41-29b24e0afc64', 'e12ffe63-448d-4469-a840-1699e9b328d1', 'New Team Phase', '{}', false, '627b6fb9-2106-4fce-ba6d-b68eeb546382');
INSERT INTO course_phase (id, course_id, name, meta_data, is_initial_phase, course_phase_type_id) VALUES ('e12ffe63-448d-4469-a840-1699e9b328d3', 'e12ffe63-448d-4469-a840-1699e9b328d1', 'Intro Course', '{}', false, '48d22f19-6cc0-417b-ac25-415fb40f2030');


--
-- Name: course_phase course_phase_pkey; Type: CONSTRAINT; Schema: public; Owner: prompt-postgres
--

ALTER TABLE ONLY course_phase
    ADD CONSTRAINT course_phase_pkey PRIMARY KEY (id);


--
-- Name: unique_initial_phase_per_course; Type: INDEX; Schema: public; Owner: prompt-postgres
--

CREATE UNIQUE INDEX unique_initial_phase_per_course ON course_phase USING btree (course_id) WHERE (is_initial_phase = true);


--
-- Name: course_phase fk_phase_type; Type: FK CONSTRAINT; Schema: public; Owner: prompt-postgres
--

ALTER TABLE ONLY course_phase
    ADD CONSTRAINT fk_phase_type FOREIGN KEY (course_phase_type_id) REFERENCES course_phase_type(id);


CREATE TABLE application_question_multi_select (
    id uuid NOT NULL,
    course_phase_id uuid NOT NULL,
    title text,
    description text,
    placeholder text,
    error_message text,
    is_required boolean,
    min_select integer,
    max_select integer,
    options text[],
    order_num integer
);


--
-- Data for Name: application_question_multi_select; Type: TABLE DATA; Schema: public; Owner: prompt-postgres
--

INSERT INTO application_question_multi_select (id, course_phase_id, title, description, placeholder, error_message, is_required, min_select, max_select, options, order_num) VALUES ('65e25b73-ce47-4536-b651-a1632347d733', '4179d58a-d00d-4fa7-94a5-397bc69fab02', 'Taken Courses', 'Which courses have you already taken ad the chair', '', '', false, 0, 3, '{Ferienakademie,Patterns,"Interactive Learning"}', 4);
INSERT INTO application_question_multi_select (id, course_phase_id, title, description, placeholder, error_message, is_required, min_select, max_select, options, order_num) VALUES ('383a9590-fba2-4e6b-a32b-88895d55fb9b', '4179d58a-d00d-4fa7-94a5-397bc69fab02', 'Available Devices', '', '', '', false, 0, 4, '{iPhone,iPad,MacBook,Vision}', 2);


--
-- Name: application_question_multi_select application_question_multi_select_pkey; Type: CONSTRAINT; Schema: public; Owner: prompt-postgres
--

ALTER TABLE ONLY application_question_multi_select
    ADD CONSTRAINT application_question_multi_select_pkey PRIMARY KEY (id);


--
-- Name: application_question_multi_select fk_course_phase; Type: FK CONSTRAINT; Schema: public; Owner: prompt-postgres
--

ALTER TABLE ONLY application_question_multi_select
    ADD CONSTRAINT fk_course_phase FOREIGN KEY (course_phase_id) REFERENCES course_phase(id) ON DELETE CASCADE;


CREATE TABLE application_question_text (
    id uuid NOT NULL,
    course_phase_id uuid NOT NULL,
    title text,
    description text,
    placeholder text,
    validation_regex text,
    error_message text,
    is_required boolean,
    allowed_length integer,
    order_num integer
);

--
-- Data for Name: application_question_text; Type: TABLE DATA; Schema: public; Owner: prompt-postgres
--

INSERT INTO application_question_text (id, course_phase_id, title, description, placeholder, validation_regex, error_message, is_required, allowed_length, order_num) VALUES ('a6a04042-95d1-4765-8592-caf9560c8c3c', '4179d58a-d00d-4fa7-94a5-397bc69fab02', 'Motivation', 'You should fill out the motivation why you want to take this absolutely amazing course.', 'Enter your motivation.', '', 'You are not allowed to enter more than 500 chars. ', true, 500, 3);
INSERT INTO application_question_text (id, course_phase_id, title, description, placeholder, validation_regex, error_message, is_required, allowed_length, order_num) VALUES ('fc8bda6d-280e-4a5e-9ebd-4bd8b68aab75', '4179d58a-d00d-4fa7-94a5-397bc69fab02', 'Expierence', '', '', '', '', false, 500, 1);


--
-- Name: application_question_text application_question_text_pkey; Type: CONSTRAINT; Schema: public; Owner: prompt-postgres
--

ALTER TABLE ONLY application_question_text
    ADD CONSTRAINT application_question_text_pkey PRIMARY KEY (id);


--
-- Name: application_question_text fk_course_phase; Type: FK CONSTRAINT; Schema: public; Owner: prompt-postgres
--

ALTER TABLE ONLY application_question_text
    ADD CONSTRAINT fk_course_phase FOREIGN KEY (course_phase_id) REFERENCES course_phase(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--
