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

CREATE type gender as enum ('male', 'female', 'diverse', 'prefer_not_to_say');


--
-- Name: student; Type: TABLE; Schema: public; Owner: prompt-postgres
--

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
-- Name: student student_email_key; Type: CONSTRAINT; Schema: public; Owner: prompt-postgres
--

ALTER TABLE ONLY student
    ADD CONSTRAINT student_email_key UNIQUE (email);


--
-- Name: student student_matriculation_number_key; Type: CONSTRAINT; Schema: public; Owner: prompt-postgres
--

ALTER TABLE ONLY student
    ADD CONSTRAINT student_matriculation_number_key UNIQUE (matriculation_number);


--
-- Name: student student_pkey; Type: CONSTRAINT; Schema: public; Owner: prompt-postgres
--

ALTER TABLE ONLY student
    ADD CONSTRAINT student_pkey PRIMARY KEY (id);


--
-- Name: student student_university_login_key; Type: CONSTRAINT; Schema: public; Owner: prompt-postgres
--

ALTER TABLE ONLY student
    ADD CONSTRAINT student_university_login_key UNIQUE (university_login);


--
-- PostgreSQL database dump complete
--

