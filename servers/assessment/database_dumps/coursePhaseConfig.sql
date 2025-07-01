--
-- PostgreSQL database dump
--
-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.13 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = ON;
SELECT pg_catalog.set_config('search_path', 'public', false);
SET check_function_bodies = false;
SET xmloption = content;
SET row_security = off;

--
-- Name: assessment_template; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_template (
    id uuid PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--
-- Name: course_phase_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_phase_config (
    assessment_template_id uuid NOT NULL,
    course_phase_id uuid PRIMARY KEY NOT NULL,
    deadline timestamp with time zone DEFAULT NULL,
    FOREIGN KEY (assessment_template_id) REFERENCES assessment_template (id) ON DELETE CASCADE
);

--
-- Data for Name: assessment_template; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.assessment_template (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Test Assessment Template', 'Test template for unit tests');

--
-- Data for Name: course_phase_config; Type: TABLE DATA; Schema: public; Owner: -
--

-- Sample data can be inserted here if needed for tests
-- INSERT INTO public.course_phase_config (assessment_template_id, course_phase_id, deadline) VALUES
-- ('550e8400-e29b-41d4-a716-446655440000', '123e4567-e89b-12d3-a456-426614174000', '2025-12-31 23:59:59+00');

--
-- PostgreSQL database dump complete
--
