-- name: GetConfirmationMailingInformation :one
SELECT 
    s.first_name,
    s.last_name,
    s.email,
    s.matriculation_number,
    s.university_login,
    s.study_degree,
    s.current_semester,
    s.study_program,
    c.name AS course_name,
    c.start_date AS course_start_date,
    c.end_date AS course_end_date,
    (p.meta_data->>'applicationEndDate')::text AS application_end_date,
    COALESCE((p.meta_data->'mailingConfig'->>'replyToEmail')::text, '')::text AS reply_to_email,
    COALESCE((p.meta_data->'mailingConfig'->>'replyToName')::text, '')::text AS reply_to_name,
    COALESCE((p.meta_data->'mailingConfig'->>'confirmationMailSubject'), '')::text AS confirmation_mail_subject,
    COALESCE((p.meta_data->'mailingConfig'->>'confirmationMail'), '')::text AS confirmation_mail_template,
    COALESCE((p.meta_data->'mailingConfig'->>'sendConfirmationMail')::boolean, false)::boolean AS send_confirmation_mail
FROM 
    course_phase_participation cpp
JOIN 
    course_participation cp ON cpp.course_participation_id = cp.id
JOIN 
    student s ON cp.student_id = s.id
JOIN 
    course_phase p ON cpp.course_phase_id = p.id
JOIN 
    course c ON p.course_id = c.id
WHERE 
    cpp.id = $1
    AND cpp.course_phase_id = $2;
