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

-- Sample data can be inserted here if needed for tests
-- INSERT INTO public.action_item (id, course_phase_id, course_participation_id, action, author) VALUES
-- ('123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002', 'Sample action', 'test@example.com');

--
-- PostgreSQL database dump complete
--
