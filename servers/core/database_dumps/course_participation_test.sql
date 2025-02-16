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
-- Name: course_participation; Type: TABLE; Schema: public; Owner: prompt-postgres
--

CREATE TABLE course_participation (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    student_id uuid NOT NULL
);


--
-- Data for Name: course_participation; Type: TABLE DATA; Schema: public; Owner: prompt-postgres
--

INSERT INTO course_participation (id, course_id, student_id) VALUES ('6e19bab2-53d0-4b6a-ac02-33b23988401a', '3f42d322-e5bf-4faa-b576-51f2cab14c2e', '3d1f3b00-87f3-433b-a713-178c4050411a');
INSERT INTO course_participation (id, course_id, student_id) VALUES ('8713d7bc-1542-4366-88a9-1fa50945b052', '3f42d322-e5bf-4faa-b576-51f2cab14c2e', '7dc1c4e8-4255-4874-80a0-0c12b958744b');
INSERT INTO course_participation (id, course_id, student_id) VALUES ('0e762fdd-c4fa-49f4-9c38-c90160cc6caa', '3f42d322-e5bf-4faa-b576-51f2cab14c2e', '500db7ed-2eb2-42d0-82b3-8750e12afa8b');
INSERT INTO course_participation (id, course_id, student_id) VALUES ('65dcc535-a9ab-4421-a2bc-0f09780ca59e', '918977e1-2d27-4b55-9064-8504ff027a1a', '500db7ed-2eb2-42d0-82b3-8750e12afa8b');
INSERT INTO course_participation (id, course_id, student_id) VALUES ('ec679792-f9e1-423c-80fa-a9f3324fefa8', '918977e1-2d27-4b55-9064-8504ff027a1a', '7dc1c4e8-4255-4874-80a0-0c12b958744b');
INSERT INTO course_participation (id, course_id, student_id) VALUES ('9f061396-e208-4b00-bc8c-f3a04bc0a212', '918977e1-2d27-4b55-9064-8504ff027a1a', '7dc1c4e8-4255-4874-80a0-0c12b958744a');


--
-- Name: course_participation course_participation_pkey; Type: CONSTRAINT; Schema: public; Owner: prompt-postgres
--

ALTER TABLE ONLY course_participation
    ADD CONSTRAINT course_participation_pkey PRIMARY KEY (id);


--
-- Name: course_participation unique_course_participation; Type: CONSTRAINT; Schema: public; Owner: prompt-postgres
--

ALTER TABLE ONLY course_participation
    ADD CONSTRAINT unique_course_participation UNIQUE (course_id, student_id);


