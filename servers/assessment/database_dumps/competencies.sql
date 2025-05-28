--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.13 (Homebrew)

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

ALTER TABLE IF EXISTS ONLY public.competency DROP CONSTRAINT IF EXISTS competency_category_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assessment DROP CONSTRAINT IF EXISTS assessment_competency_id_fkey;
DROP INDEX IF EXISTS public.idx_assessment_completion_participation_phase;
ALTER TABLE IF EXISTS ONLY public.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.competency DROP CONSTRAINT IF EXISTS competency_pkey;
ALTER TABLE IF EXISTS ONLY public.category DROP CONSTRAINT IF EXISTS category_pkey;
ALTER TABLE IF EXISTS ONLY public.assessment DROP CONSTRAINT IF EXISTS assessment_pkey;
ALTER TABLE IF EXISTS ONLY public.assessment DROP CONSTRAINT IF EXISTS assessment_course_participation_id_course_phase_id_competen_key;
ALTER TABLE IF EXISTS ONLY public.assessment_completion DROP CONSTRAINT IF EXISTS assessment_completion_pkey;
DROP TABLE IF EXISTS public.schema_migrations;
DROP VIEW IF EXISTS public.completed_score_levels;
DROP VIEW IF EXISTS public.weighted_participant_scores;
DROP TABLE IF EXISTS public.competency;
DROP TABLE IF EXISTS public.category;
DROP TABLE IF EXISTS public.assessment_completion;
DROP TABLE IF EXISTS public.assessment;
DROP TYPE IF EXISTS public.score_level;
--
-- Name: score_level; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.score_level AS ENUM (
    'novice',
    'intermediate',
    'advanced',
    'expert'
);


SET default_table_access_method = heap;

--
-- Name: assessment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment (
    id uuid NOT NULL,
    course_participation_id uuid NOT NULL,
    course_phase_id uuid NOT NULL,
    competency_id uuid NOT NULL,
    score public.score_level NOT NULL,
    comment text,
    assessed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    author text DEFAULT ''::text NOT NULL
);


--
-- Name: assessment_completion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessment_completion (
    course_participation_id uuid NOT NULL,
    course_phase_id uuid NOT NULL,
    completed_at timestamp with time zone NOT NULL,
    author text NOT NULL
);


--
-- Name: category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.category (
    id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    weight integer DEFAULT 1 NOT NULL,
    short_name character varying(10)
);


--
-- Name: competency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.competency (
    id uuid NOT NULL,
    category_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    novice text NOT NULL,
    intermediate text NOT NULL,
    advanced text NOT NULL,
    expert text NOT NULL,
    weight integer DEFAULT 1 NOT NULL,
    short_name character varying(10)
);

--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version bigint NOT NULL,
    dirty boolean NOT NULL
);

--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.category VALUES ('25f1c984-ba31-4cf2-aa8e-5662721bf44e', 'Version Control', '', 1, 'Git');
INSERT INTO public.category VALUES ('815b159b-cab3-49b4-8060-c4722d59241d', 'User Interface', '', 1, 'UI');
INSERT INTO public.category VALUES ('9107c0aa-15b7-4967-bf62-6fa131f08bee', 'Fundamentals in Software Engineering', '', 1, 'SE');


--
-- Data for Name: competency; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.competency VALUES ('20725c05-bfd7-45a7-a981-d092e14f98d3', '25f1c984-ba31-4cf2-aa8e-5662721bf44e', 'GitLab Project Management', 'Understand GitLab’s collaboration features, including issue tracking, merge request workflows, and navigation of the issue board.', 'Can create and manage repositories and basic issues.', 'Can manage issues, labels, and milestones; creates and reviews MRs. ', 'Can manage issue workflows, works together with Tutor on Reviews, and enforces best practices.', 'Defines and optimizes issue tracking and MR processes for efficient collaboration. ', 1, 'GitLab PM');
INSERT INTO public.competency VALUES ('0431b736-7fab-4333-b83e-fe3927f32475', '9107c0aa-15b7-4967-bf62-6fa131f08bee', 'Requirements & Backlog Management', 'Understand and apply structured documentation techniques such as product backlogs and requirement artifacts. Use common principles as Abbots Technique or FURPS+', 'Writes simple user stories but lacks clarity and adherence to best practices.', 'Creates well-structured user stories using INVEST criteria and documents them systematically.', 'Manages a product backlog effectively, refining requirements iteratively.', 'Ensures requirement traceability, prioritization, and alignment with long-term goals.', 1, NULL);
INSERT INTO public.competency VALUES ('36af9432-0b0e-49e0-93d0-5044b7bed1c8', '9107c0aa-15b7-4967-bf62-6fa131f08bee', 'Architecture and System Design', 'Understand and apply architectural principles, including top-level architecture, subsystem decomposition, and deployment diagrams.', 'Recognizes key architectural elements and struggles with formal documentation.', 'Creates high-level system architecture with some guidance.', 'Develops and evaluates scalable architectures tailored to project requirements.', 'Designs architecture with clear subsystem decomposition, using SDD and API specifications.', 1, NULL);
INSERT INTO public.competency VALUES ('2fc14584-d82c-47c2-9f75-22276d9809ef', '9107c0aa-15b7-4967-bf62-6fa131f08bee', 'Software Engineering & Modeling', 'Recognize why modeling is important in software engineering and how it contributes to structured development.', 'Has a basic understanding of software engineering and modeling but struggles to phrase their significance.', 'Understands the role of modeling in software engineering and can explain why it is useful.', 'Applies model-based approaches to structure software development and can justify their importance.', 'Critically evaluates modeling techniques and adapts them to project-specific needs.', 1, NULL);
INSERT INTO public.competency VALUES ('54dbdc81-8566-4353-ace4-e2a8252a8c59', '815b159b-cab3-49b4-8060-c4722d59241d', 'Low-Fidelity Mockups / Prototyping', 'Learn UI wireframing and prototyping using pen & paper (not tool-bound. Create low-fidelity mockups for the intro course app and the first SwiftUI non-functional requirement (NFR). ', 'Sketches basic UI ideas but lacks structure and clarity.', 'Creates structured wireframes with a focus on layout and usability.', 'Designs clear and functional low-fidelity prototypes, considering user flow and NFRs.', 'Rapidly iterates on mockups, ensuring usability and alignment with design principles.', 1, NULL);
INSERT INTO public.competency VALUES ('31aea83e-407b-4428-a5da-b25dd562832b', '815b159b-cab3-49b4-8060-c4722d59241d', 'Apple''s Human Interface Guidelines', 'Understand the Human Interface Guidelines (HIG) and how SwiftUI supports cross-platform compliance, especially for non-functional requirements of the intro course app.', 'Recognizes that HIG exists and affects app design.', 'Understands core principles of HIG and applies basic guidelines in SwiftUI.', 'Integrates HIG principles effectively, ensuring usability and consistency.', 'Applies HIG to enhance usability and consistency across platforms, aligning with Apple’s best practices.', 1, NULL);
INSERT INTO public.competency VALUES ('eb36bf49-87c2-429b-a87e-a930630a3fe3', '25f1c984-ba31-4cf2-aa8e-5662721bf44e', 'Git Basics', 'Learn and apply Git workflows, key commands, and best practices, including branching models, commit conventions, and the differences between CLI and GUI tools.', 'Can initialize a repository and commit changes.', 'Can create branches, merge changes, and resolve basic conflicts.', 'Follows a structured Git workflow with a clear branching model, adopts meaningful commit messages.', 'Optimizes Git usage, enforces best practices, mentors others in efficient Git workflows.', 2, NULL);


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.schema_migrations VALUES (8, false);


--
-- Name: assessment_completion assessment_completion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment_completion
    ADD CONSTRAINT assessment_completion_pkey PRIMARY KEY (course_participation_id, course_phase_id);


--
-- Name: assessment assessment_course_participation_id_course_phase_id_competen_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment
    ADD CONSTRAINT assessment_course_participation_id_course_phase_id_competen_key UNIQUE (course_participation_id, course_phase_id, competency_id);


--
-- Name: assessment assessment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment
    ADD CONSTRAINT assessment_pkey PRIMARY KEY (id);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: competency competency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competency
    ADD CONSTRAINT competency_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: idx_assessment_completion_participation_phase; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assessment_completion_participation_phase ON public.assessment_completion USING btree (course_participation_id, course_phase_id);


--
-- Name: assessment assessment_competency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessment
    ADD CONSTRAINT assessment_competency_id_fkey FOREIGN KEY (competency_id) REFERENCES public.competency(id) ON DELETE CASCADE;


--
-- Name: competency competency_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competency
    ADD CONSTRAINT competency_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.category(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

