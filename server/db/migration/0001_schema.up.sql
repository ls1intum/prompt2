BEGIN;

CREATE TYPE gender AS ENUM (
  'male',
  'female', 
  'diverse',
  'prefer_not_to_say'
);

CREATE TYPE course_type as ENUM (
  'lecture',
  'seminar',
  'practical course'
);

-- UK data standard for full name is 70 chars and for mail 255 chars
CREATE TABLE student (
 	id 			      uuid PRIMARY KEY, 
  first_name 	            varchar(50),
  last_name	              varchar(50),
  email		                varchar(255) UNIQUE, 
  matriculation_number    varchar(30) UNIQUE,
  university_login		    varchar(20) UNIQUE, 
  has_university_account  boolean, 
  gender gender NOT NULL
);

CREATE TABLE course (
  id   		      uuid 	PRIMARY KEY,
  name 		      text     NOT NULL,
  start_date    date,
  end_date      date,
  semester_tag  text, 
  course_type   course_type NOT NULL,
  ects          int,
  meta_data     jsonb
);

CREATE TABLE course_phase_type (
    id uuid PRIMARY KEY,
    name text UNIQUE NOT NULL
);

CREATE TABLE course_phase (
  id   		          uuid PRIMARY KEY,
  course_id         uuid NOT NULL,
  name 		          text,
  meta_data         jsonb,
  is_initial_phase  boolean NOT NULL,
  course_phase_type_id     uuid NOT NULL,
  CONSTRAINT fk_course
    FOREIGN KEY (course_id) 
    REFERENCES course(id) ON DELETE CASCADE,
  CONSTRAINT fk_phase_type 
    FOREIGN KEY (course_phase_type_id) 
    REFERENCES course_phase_type(id)
);

CREATE UNIQUE INDEX unique_initial_phase_per_course
ON course_phase(course_id)
WHERE is_initial_phase = true;

CREATE TABLE course_participation (
 	id 		          uuid PRIMARY KEY, 
  course_id       uuid NOT NULL,
  student_id      uuid NOT NULL,
  CONSTRAINT fk_student
    FOREIGN KEY (student_id) 
    REFERENCES student(id) ON DELETE CASCADE,
  CONSTRAINT fk_course
    FOREIGN KEY (course_id) 
    REFERENCES course(id) ON DELETE CASCADE,
  CONSTRAINT unique_course_participation 
    UNIQUE (course_id, student_id)
);

CREATE TABLE course_phase_participation (
 	id 		                  uuid PRIMARY KEY, 
  course_participation_id uuid NOT NULL,
  course_phase_id         uuid NOT NULL,
  passed 	                boolean,
  meta_data               jsonb,
  CONSTRAINT fk_course_participation
    FOREIGN KEY (course_participation_id) 
    REFERENCES course_participation(id) ON DELETE CASCADE,
  CONSTRAINT fk_course_phase
    FOREIGN KEY (course_phase_id)
    REFERENCES course_phase(id) ON DELETE CASCADE,
  CONSTRAINT unique_course_phase_participation 
    UNIQUE (course_participation_id, course_phase_id)
);

-- We decided to enforce a 1:1 mapping, as otherwise the graph could become cyclic and the SQL request to retrieve the graph could become highly nested. Today, we do not see a strong use case, where a complex, not linear graph is needed.
-- It is still needed as a separate table, as uuid have to be not null. At the creation of one course phase, the next course might not be known yet.
CREATE TABLE course_phase_graph (
  from_course_phase_id  uuid   NOT NULL,
  to_course_phase_id    uuid     NOT NULL,
  CONSTRAINT fk_from_course_phase
    FOREIGN KEY (from_course_phase_id)
    REFERENCES course_phase(id) ON DELETE CASCADE,
  CONSTRAINT fk_to_course_phase
    FOREIGN KEY (to_course_phase_id)
    REFERENCES course_phase(id) ON DELETE CASCADE,
  CONSTRAINT unique_from_course_phase UNIQUE (from_course_phase_id),
  CONSTRAINT unique_to_course_phase UNIQUE (to_course_phase_id)
);

CREATE TABLE application_question_text (
  id uuid PRIMARY KEY,
  course_phase_id uuid NOT NULL,
  title text, 
  description text, 
  placeholder text, 
  validation_regex text, 
  error_message text, 
  is_required boolean,
  allowed_length int,
  order_num int,
  CONSTRAINT fk_course_phase
    FOREIGN KEY (course_phase_id)
    REFERENCES course_phase(id) ON DELETE CASCADE
);

CREATE TABLE application_question_multi_select (
  id uuid PRIMARY KEY,
  course_phase_id uuid NOT NULL,
  title text, 
  description text, 
  placeholder text, 
  error_message text, 
  is_required boolean,
  min_select int,
  max_select int, 
  options text[],
  order_num int,
  CONSTRAINT fk_course_phase
    FOREIGN KEY (course_phase_id)
    REFERENCES course_phase(id) ON DELETE CASCADE
);

CREATE TABLE application_answer_text (
  id uuid PRIMARY KEY,
  application_question_id uuid NOT NULL,
  course_phase_participation_id uuid NOT NULL,
  answer text,
  CONSTRAINT fk_application_question
    FOREIGN KEY (application_question_id)
    REFERENCES application_question_text(id) ON DELETE CASCADE,
  CONSTRAINT fk_course_phase_participation
    FOREIGN KEY (course_phase_participation_id)
    REFERENCES course_phase_participation(id) ON DELETE CASCADE,
  CONSTRAINT unique_application_answer_text
    UNIQUE (course_phase_participation_id, application_question_id)
  
);

CREATE TABLE application_answer_multi_select (
  id uuid PRIMARY KEY,
  application_question_id uuid NOT NULL,
  course_phase_participation_id uuid NOT NULL,
  answer text[],
  CONSTRAINT fk_application_question
    FOREIGN KEY (application_question_id)
    REFERENCES application_question_multi_select(id) ON DELETE CASCADE, 
  CONSTRAINT fk_course_phase_participation
    FOREIGN KEY (course_phase_participation_id)
    REFERENCES course_phase_participation(id) ON DELETE CASCADE,
  CONSTRAINT unique_application_answer_multi_select
    UNIQUE (course_phase_participation_id, application_question_id)
);

CREATE TABLE application_assessment (
  id uuid PRIMARY KEY,
  course_phase_participation_id uuid NOT NULL,
  score int,
  CONSTRAINT fk_course_phase_participation
    FOREIGN KEY (course_phase_participation_id)
    REFERENCES course_phase_participation(id) ON DELETE CASCADE
);

COMMIT;