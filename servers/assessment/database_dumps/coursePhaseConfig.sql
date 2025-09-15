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
    self_evaluation_enabled boolean NOT NULL DEFAULT false,
    self_evaluation_template uuid,
    self_evaluation_deadline timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    peer_evaluation_enabled boolean NOT NULL DEFAULT false,
    peer_evaluation_template uuid,
    peer_evaluation_deadline timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    start timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    self_evaluation_start timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    peer_evaluation_start timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tutor_evaluation_enabled boolean NOT NULL DEFAULT false,
    tutor_evaluation_start timestamp with time zone,
    tutor_evaluation_deadline timestamp with time zone,
    tutor_evaluation_template uuid,
    FOREIGN KEY (assessment_template_id) REFERENCES assessment_template (id) ON DELETE CASCADE,
    FOREIGN KEY (self_evaluation_template) REFERENCES assessment_template (id) ON DELETE RESTRICT,
    FOREIGN KEY (peer_evaluation_template) REFERENCES assessment_template (id) ON DELETE RESTRICT,
    FOREIGN KEY (tutor_evaluation_template) REFERENCES assessment_template (id) ON DELETE RESTRICT
);

--
-- Data for Name: assessment_template; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.assessment_template (id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Test Assessment Template', 'Test template for unit tests'),
('550e8400-e29b-41d4-a716-446655440001', 'Self Evaluation Template', 'This is the default self evaluation template.'),
('550e8400-e29b-41d4-a716-446655440002', 'Peer Evaluation Template', 'This is the default peer evaluation template.'),
('550e8400-e29b-41d4-a716-446655440003', 'Tutor Evaluation Template', 'This is the default tutor evaluation template.');

--
-- Data for Name: course_phase_config; Type: TABLE DATA; Schema: public; Owner: -
--

-- Sample data can be inserted here if needed for tests
-- INSERT INTO public.course_phase_config (assessment_template_id, course_phase_id, deadline, self_evaluation_enabled, self_evaluation_template, self_evaluation_deadline, peer_evaluation_enabled, peer_evaluation_template, peer_evaluation_deadline) VALUES
-- ('550e8400-e29b-41d4-a716-446655440000', '123e4567-e89b-12d3-a456-426614174000', '2025-12-31 23:59:59+00', true, '550e8400-e29b-41d4-a716-446655440001', '2025-12-31 23:59:59+00', true, '550e8400-e29b-41d4-a716-446655440002', '2025-12-31 23:59:59+00');

--
-- PostgreSQL database dump complete
--
