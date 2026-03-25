let registerMode = true;

// DOM Elements
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const switchForm = document.getElementById('switchForm');
const message = document.getElementById('message');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Toggle between Login and Register
switchForm.onclick = () => {
    registerMode = !registerMode;
    formTitle.innerText = registerMode ? 'Register' : 'Login';
    submitBtn.innerText = registerMode ? 'Register' : 'Login';
    switchForm.innerText = registerMode ? 'Already have an account? Login' : 'No account? Register';
    message.innerText = '';
    
    // Clear inputs on toggle
    usernameInput.value = '';
    passwordInput.value = '';
};

// Handle Form Submission
submitBtn.onclick = async () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        message.innerText = "Please fill all fields";
        return;
    }

const url = registerMode ? 'http://localhost:3000/register' : 'http://localhost:3000/login';

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        message.innerText = data.message;

        if (data.success && !registerMode) {
            // Success! Redirect to the main app page
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error("Error:", error);
        message.innerText = "Connection error. Please try again.";
    }
};