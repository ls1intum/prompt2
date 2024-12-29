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

--
-- PostgreSQL database dump complete
--
