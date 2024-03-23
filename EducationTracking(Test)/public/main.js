document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                if (data.message === 'Logged in successfully') {
                    // Store userId for use in subsequent requests
                    localStorage.setItem('userId', data.userId); 
                    // Redirect to dashboard page
                    window.location.href = '/dashboard.html'; 
                } else {
                    alert('Login failed. Please check your credentials.');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Login error. Please try again later.');
            });
        });
    }

    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
            }

            fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password }),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
                if (data.message === 'Registered successfully') {
                    // Redirect to login page
                    window.location.href = '/index.html'; 
                } else {
                    alert('Signup failed. Please try again.');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Signup error. Please try again later.');
            });
        });
    }
});




