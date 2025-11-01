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
-- Name: action_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.action_item (
    id uuid NOT NULL PRIMARY KEY,
    course_phase_id uuid NOT NULL,
    course_participation_id uuid NOT NULL,
    action text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    author text NOT NULL
);

--
-- Data for Name: action_item; Type: TABLE DATA; Schema: public; Owner: -
--

-- Test data for visibility tests
INSERT INTO public.action_item (id, course_phase_id, course_participation_id, action, author) VALUES
    ('a1111111-1111-1111-1111-111111111111', '24461b6b-3c3a-4bc6-ba42-69eeb1514da9', 'ca42e447-60f9-4fe0-b297-2dae3f924fd7', 'Test action item for visible scenario', 'tester'),
    ('a2222222-2222-2222-2222-222222222222', '3517a3e3-fe60-40e0-8a5e-8f39049c12c3', 'ca42e447-60f9-4fe0-b297-2dae3f924fd7', 'Test action item for not visible scenario', 'tester');

--
-- PostgreSQL database dump complete
--
