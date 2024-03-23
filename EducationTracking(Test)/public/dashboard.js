document.addEventListener('DOMContentLoaded', function() {
    const tablinks = document.getElementsByClassName("tab-link");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].addEventListener("click", function(e) {
            openTab(e, this.getAttribute("data-target"));
        });
    }

    // Fetch and display information upon loading the dashboard
    setupTabs();
    fetchGPA();
    fetchProgress();
    fetchCourses();
    fetchAssignments();
    fetchAndDisplayNotifications();
});


function setupTabs() {
    const tabLinks = document.querySelectorAll(".tab-link");
    tabLinks.forEach(tab => {
        tab.addEventListener("click", function(e) {
            openTab(e, this.getAttribute("data-target"));
        });
    });

    // Set up for nested visualization tabs specifically
    setupVisualizationTabs();
}

function setupVisualizationTabs() {
    const visualizationTabs = document.querySelectorAll('.visualization-tabs .visualization-tab-link');
    visualizationTabs.forEach(tab => {
        tab.addEventListener("click", function(e) {
            openVisualizationTab(e, this.getAttribute("data-target"));
        });
    });

    // Automatically click the first visualization tab if it exists
    if (visualizationTabs.length > 0) {
        visualizationTabs[0].click();
    }
}

function openTab(evt, tabName) {
    const tabContents = document.querySelectorAll(".tab-content");
    tabContents.forEach(tc => tc.style.display = "none");

    const tablinks = document.querySelectorAll(".tab-link");
    tablinks.forEach(tl => tl.classList.remove("active"));

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

function openVisualizationTab(evt, tabName) {
    // Hide all visualization contents within the visualization section
    const visualizationContents = document.querySelectorAll('.visualization-tab-content');
    visualizationContents.forEach(content => content.style.display = "none");

    // Remove "active" class from all visualization tab links
    const visualizationTabs = document.querySelectorAll('.visualization-tabs .visualization-tab-link');
    visualizationTabs.forEach(tab => tab.classList.remove("active"));

    // Display the chosen visualization content and add "active" class to the clicked tab
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

function fetchGPA() {
    const userId = localStorage.getItem('userId');
    fetch('/calculateGPA', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'user-id': userId
        }
    })
    .then(handleResponse)
    .then(data => {
        document.getElementById('GPA').innerText = `Your GPA is ${data.gpa}`;
    })
    .catch(error => console.error('Error fetching GPA:', error));
}


function fetchCourses() {
    const userId = localStorage.getItem('userId');
    fetch('/courses', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'user-id': userId
        }
    })
    .then(handleResponse)
    .then(courses => {
        const coursesDiv = document.getElementById('Courses');
        coursesDiv.innerHTML = courses.map(course => `<p>${course.name} - ${course.instructor}</p>`).join('');
    })
    .catch(error => console.error('Error fetching courses:', error));
}

function fetchAssignments() {
    const userId = localStorage.getItem('userId');
    fetch('/upcomingAssignments', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'user-id': userId
        }
    })
    .then(handleResponse)
    .then(assignments => {
        const assignmentsDiv = document.getElementById('Assignments');
        assignmentsDiv.innerHTML = assignments.map(assignment => `<p>${assignment.name} due on ${new Date(assignment.due_date).toLocaleDateString()}</p>`).join('');
    })
    .catch(error => console.error('Error fetching assignments:', error));
}

function fetchAndDisplayNotifications() {
    const userId = localStorage.getItem('userId');
    fetch('/fetchNotifications', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'user-id': userId
        }
    })
    .then(handleResponse)
    .then(notifications => {
        const notificationsDiv = document.getElementById('Notifications');
        if (notifications.length > 0) {
            notificationsDiv.innerHTML = notifications.map(notification => `
                <div class="notification">
                    <p>${notification.message}</p>
                    <small>Due: ${new Date(notification.due_date).toLocaleDateString()}</small>
                </div>
            `).join('');
        } else {
            notificationsDiv.innerHTML = '<p>No new notifications.</p>';
        }
    })
    .catch(error => console.error('Error fetching notifications:', error));
}

function handleResponse(response) {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}


function fetchCourseInfo() {
    const isbn = '9780134093413'; 
    fetch(`https://openlibrary.org/isbn/${isbn}.json`)
        .then(response => response.json())
        .then(data => {
            const courseInfoDiv = document.getElementById('Courses');
            courseInfoDiv.innerHTML += `<p>Textbook info for a course: ${data.title} by ${data.authors.map(author => author.name).join(', ')}</p>`;
        })
        .catch(error => console.error('Error fetching course info:', error));
}

function fetchProgress() {
    const userId = localStorage.getItem('userId');
    fetch('/progressData', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'user-id': userId
        }
    })
    .then(handleResponse)
    .then(data => {
        initGradeChart(data.courses);
        initGradeDistributionChart(data.gradeDistribution);
        initAssignmentDeadlineChart(data.assignments);
    })
    .catch(error => console.error('Error fetching progress data:', error));
}

function initGradeChart(data) {
    const ctx = document.getElementById('gradeChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.courseName),
            datasets: [{
                label: 'Grades',
                data: data.map(item => item.averageGrade),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initGradeDistributionChart(data) {
    const ctx = document.getElementById('gradeDistributionChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, 
            aspectRatio: 2
        }
    });
}


function initAssignmentDeadlineChart(data) {
    const ctx = document.getElementById('assignmentDeadlineChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                label: 'Days Until Due',
                data: data.map(item => item.daysUntilDue),
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.getElementById('logoutButton').addEventListener('click', function() {
    // Request server to logout
    fetch('/logout')
    .then(response => response.json())
    .then(data => {
        console.log(data.message); // Logout successful
        localStorage.removeItem('userId'); // Clear client-side session
        window.location.href = '/index.html'; // Redirect to login page
    })
    .catch(error => console.error('Logout failed:', error));
});




