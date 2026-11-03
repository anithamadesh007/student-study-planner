CREATE DATABASE study_planner;

USE study_planner;


CREATE TABLE subjects (

    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE

);


CREATE TABLE assignments (

    id INT AUTO_INCREMENT PRIMARY KEY,

    subject VARCHAR(100) NOT NULL,

    title VARCHAR(200) NOT NULL,

    deadline DATE NOT NULL,

    status
        ENUM(
            'Pending',
            'In Progress',
            'Completed'
        )
        DEFAULT 'Pending',

    created_at
        TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP

);


INSERT INTO subjects
(name)
VALUES

('Web Technology'),

('JavaScript'),

('PHP'),

('Node.js');


INSERT INTO assignments
(
    subject,
    title,
    deadline,
    status
)
VALUES

(
    'Web Technology',
    'HTML Forms',
    '2026-09-30',
    'Completed'
),

(
    'JavaScript',
    'DOM Manipulation',
    '2026-10-03',
    'In Progress'
),

(
    'PHP',
    'Form Validation',
    '2026-10-05',
    'Pending'
),

(
    'Node.js',
    'HTTP Server & File Operations',
    '2026-10-11',
    'Pending'
);