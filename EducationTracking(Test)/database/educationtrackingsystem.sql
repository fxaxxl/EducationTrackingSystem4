USE educationtrackingsystem;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL
);

CREATE TABLE `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `instructor` VARCHAR(255),
  `description` TEXT,
  `semester` VARCHAR(100),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);


CREATE TABLE `grades` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `type` VARCHAR(100), 
  `description` TEXT,
  `grade` DECIMAL(5,2),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
);


CREATE TABLE `assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `course_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `due_date` DATE NOT NULL,
  `description` TEXT,
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE
);


CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `message` TEXT NOT NULL,
  `due_date` DATE,
  `is_read` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);



--test data for used id 1
INSERT INTO courses (user_id, name, instructor, description, semester) VALUES
(1, 'Computer Science 101', 'Peter Miles', 'Introduction to Computer Science', 'Fall 2024'),
(1, 'Mathematics 101', 'Hellen Gupta', 'Introduction to Mathematics', 'Fall 2024'),
(1, 'Web Development 102', 'Laura Johnson', 'Intermediate concepts in web development', 'Winter 2024'),
(1, 'Data Structures 201', 'Rajesh Kumar', 'In-depth study of data structures', 'Winter 2024'),
(1, 'Artificial Intelligence 301', 'Susan Lee', 'Fundamentals of AI and machine learning', 'Spring 2025'),
(1, 'Database Systems 202', 'Mohamed Ali', 'Design and use of database systems', 'Spring 2025'),
(1, 'Software Engineering 303', 'Carlos Rodriguez', 'Software development life cycle and methodologies', 'Fall 2025'),
(1, 'Network Security 204', 'Aisha Yousuf', 'Principles and practices in network security', 'Fall 2025');


INSERT INTO grades (course_id, type, description, grade) VALUES
(1, 'Exam', 'Midterm Exam', 85.00),
(1, 'Homework', 'Homework 1', 90.00),
(2, 'Exam', 'Final Exam', 88.00),
(1, 'Quiz', 'Quiz on HTML/CSS', 92.00),
(1, 'Assignment', 'Responsive design task', 87.00),
(2, 'Quiz', 'Quiz on Trees and Graphs', 90.00),
(2, 'Assignment', 'Binary Search Tree implementation', 93.00),
(3, 'Project', 'AI chatbot development', 89.00),
(3, 'Exam', 'End-term Exam', 86.00);

INSERT INTO assignments (course_id, name, due_date, description) VALUES
(1, 'Homework 2', CURDATE() + INTERVAL 7 DAY, 'Homework on algorithms'),
(2, 'Project 1', CURDATE() + INTERVAL 10 DAY, 'Mathematics project on statistics'),
(1, 'Group Project', CURDATE() + INTERVAL 15 DAY, 'Group project on web app development'),
(2, 'Lab Assignment', CURDATE() + INTERVAL 20 DAY, 'Lab assignment on sorting algorithms'),
(3, 'Research Paper', CURDATE() + INTERVAL 30 DAY, 'Research paper on recent trends in AI'),
(4, 'SQL Queries', CURDATE() + INTERVAL 25 DAY, 'Set of SQL queries for database manipulation'),
(5, 'Case Study', CURDATE() + INTERVAL 18 DAY, 'Case study on a software development process'),
(6, 'Security Audit', CURDATE() + INTERVAL 22 DAY, 'Perform a security audit on a provided network');

INSERT INTO notifications (user_id, message, due_date, is_read) VALUES
(1, 'You have an upcoming exam next week.', CURDATE() + INTERVAL 7 DAY, FALSE),
(1, 'Homework 3 is due soon.', CURDATE() + INTERVAL 14 DAY, FALSE),
(1, 'Meeting with academic advisor scheduled for next week.', CURDATE() + INTERVAL 5 DAY, FALSE),
(1, 'New course materials available for Web Development 102.', CURDATE() + INTERVAL 2 DAY, FALSE),
(1, 'Update on group project assignment for Data Structures 201.', CURDATE() + INTERVAL 3 DAY, FALSE),
(1, 'Library due date for borrowed books.', CURDATE() + INTERVAL 1 DAY, FALSE),
(1, 'Volunteer opportunities for computer science tutors.', CURDATE() + INTERVAL 8 DAY, FALSE),
(1, 'Guest lecture on cybersecurity trends.', CURDATE() + INTERVAL 12 DAY, FALSE);


