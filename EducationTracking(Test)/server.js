const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.static('public')); // Serve static files from 'public' directory

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to the MySQL database.');
});

// Utility function to get user ID
function getUserId(req) {
    return req.headers['user-id'];
}

// Signup route
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(query, [name, email, hashedPassword], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
        }
        res.status(201).json({ message: 'Registered successfully' });
    });
});

// Login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT id, password FROM users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0 || !(await bcrypt.compare(password, results[0].password))) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        res.status(200).json({ message: 'Logged in successfully', userId: results[0].id });
    });
});

// Add this route for logout
app.get('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});


// Fetch Courses for the Logged-in User
app.get('/courses', (req, res) => {
    const userId = getUserId(req); 

    db.query('SELECT * FROM courses WHERE user_id = ?', [userId], (err, results) => {
        if (err) {
            console.error('Failed to fetch courses', err);
            res.status(500).json({ message: 'Error fetching courses.' });
        } else {
            res.json(results);
        }
    });
});


// Calculate GPA
app.get('/calculateGPA', (req, res) => {
    const userId = getUserId(req); 
    
    db.query(`
        SELECT AVG(g.grade) as gpa
        FROM grades g
        JOIN courses c ON g.course_id = c.id
        WHERE c.user_id = ?`, 
        [userId], 
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Error calculating GPA.' });
            } else {
                // Check if result[0].gpa is not null before calling toFixed
                const gpa = result[0].gpa !== null ? result[0].gpa.toFixed(2) : "N/A";
                res.json({ gpa: gpa });
            }
    });
});

// Progress Data
app.get('/progressData', (req, res) => {
    const userId = getUserId(req);
    
    // Query for average grades per course
    const avgGradeQuery = `
        SELECT c.name as courseName, AVG(g.grade) as averageGrade
        FROM courses c
        JOIN grades g ON c.id = g.course_id
        WHERE c.user_id = ?
        GROUP BY c.name`;

    // Query for grade distribution
    const gradeDistQuery = `
        SELECT grade, COUNT(*) as count
        FROM grades g
        JOIN courses c ON g.course_id = c.id
        WHERE c.user_id = ?
        GROUP BY grade`;

    // Query for assignments and their deadlines
    const assignmentQuery = `
        SELECT a.name, DATEDIFF(a.due_date, CURDATE()) as daysUntilDue
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        WHERE c.user_id = ? AND a.due_date >= CURDATE()
        ORDER BY a.due_date ASC`;

    // Execute all queries in parallel
    Promise.all([
        new Promise((resolve, reject) => db.query(avgGradeQuery, [userId], (err, results) => err ? reject(err) : resolve(results))),
        new Promise((resolve, reject) => db.query(gradeDistQuery, [userId], (err, results) => err ? reject(err) : resolve(results))),
        new Promise((resolve, reject) => db.query(assignmentQuery, [userId], (err, results) => err ? reject(err) : resolve(results)))
    ]).then(([avgGrades, gradeDist, assignments]) => {
        
        // Transform grade distribution data for chart
        let gradeDistribution = {};
        gradeDist.forEach(item => {
            gradeDistribution[`Grade ${item.grade}`] = item.count;
        });

        res.json({
            courses: avgGrades,
            gradeDistribution: gradeDistribution,
            assignments: assignments.map(a => ({...a, daysUntilDue: Number(a.daysUntilDue)}))
        });
    }).catch(err => {
        console.error('Error fetching progress data:', err);
        res.status(500).json({ message: 'Error fetching progress data.' });
    });
});


// Upcoming Assignments
app.get('/upcomingAssignments', (req, res) => {
    const userId = getUserId(req); 
    
    db.query(`
        SELECT a.name, a.due_date
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        WHERE c.user_id = ? AND a.due_date >= CURDATE()
        ORDER BY a.due_date ASC`, 
        [userId], 
        (err, assignments) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: 'Error fetching upcoming assignments.' });
            } else {
                res.json(assignments);
            }
    });
});


// Fetch Notifications for the Logged-in User
app.get('/fetchNotifications', (req, res) => {
    const userId = getUserId(req);
    
    db.query('SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY due_date ASC', [userId], (err, results) => {
        if (err) {
            console.error('Failed to fetch notifications', err);
            res.status(500).json({ message: 'Error fetching notifications.' });
        } else {
            res.json(results);
        }
    });
});


// Start server and automatically open the browser (Conceptual)
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Access the app at http://localhost:${port}`);
});